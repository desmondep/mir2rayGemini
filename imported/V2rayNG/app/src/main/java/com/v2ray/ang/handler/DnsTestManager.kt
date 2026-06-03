package com.v2ray.ang.handler

import java.io.ByteArrayOutputStream
import java.io.DataOutputStream
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.InetAddress
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

object DnsTestManager {
    data class DnsServer(val name: String, val ip: String)
    
    data class DnsTestResult(
        val server: DnsServer,
        val avgPing: Long,
        val packetLoss: Int, // percentage 0-100
        val jitter: Long,
        val accuracy: Int // percentage 0-100
    )

    val publicDnsServers = listOf(
        DnsServer("Cloudflare", "1.1.1.1"),
        DnsServer("Cloudflare Alt", "1.0.0.1"),
        DnsServer("Cloudflare Malware", "1.1.1.2"),
        DnsServer("Cloudflare Family", "1.1.1.3"),
        DnsServer("Google", "8.8.8.8"),
        DnsServer("Google Alt", "8.8.4.4"),
        DnsServer("OpenDNS", "208.67.222.222"),
        DnsServer("OpenDNS Alt", "208.67.220.220"),
        DnsServer("OpenDNS Family", "208.67.222.123"),
        DnsServer("Quad9", "9.9.9.9"),
        DnsServer("Quad9 Alt", "149.112.112.112"),
        DnsServer("Quad9 Unsec", "9.9.9.10"),
        DnsServer("AdGuard", "94.140.14.14"),
        DnsServer("AdGuard Alt", "94.140.15.15"),
        DnsServer("AdGuard Family", "94.140.14.15"),
        DnsServer("Comodo Secure", "8.26.56.26"),
        DnsServer("Comodo Alt", "8.20.247.20"),
        DnsServer("Level3", "209.244.0.3"),
        DnsServer("Level3 Alt", "209.244.0.4"),
        DnsServer("Verisign", "64.6.64.6"),
        DnsServer("Verisign Alt", "64.6.65.6"),
        DnsServer("DNS.WATCH", "84.200.69.80"),
        DnsServer("DNS.WATCH Alt", "84.200.70.40"),
        DnsServer("Alternate DNS", "76.76.19.19"),
        DnsServer("Hurrican Elec", "74.82.42.42"),
        DnsServer("Neustar", "156.154.70.1"),
        DnsServer("SafeDNS", "195.46.39.39"),
        DnsServer("SafeDNS Alt", "195.46.39.40"),
        DnsServer("Yandex.DNS", "77.88.8.8"),
        DnsServer("Yandex.DNS Alt", "77.88.8.1"),
        DnsServer("CleanBrowsing", "185.228.168.9"),
        DnsServer("Freenom World", "80.80.80.80"),
        DnsServer("Mullvad DNS", "194.242.2.2"),
        DnsServer("Mullvad AdBlock", "194.242.2.3"),
        DnsServer("ControlD", "76.76.2.0"),
        DnsServer("ControlD Alt", "76.76.10.0"),
        DnsServer("NextDNS", "45.90.28.0"),
        DnsServer("NextDNS Alt", "45.90.30.0")
    )
    
    val iranianDnsServers = listOf(
        DnsServer("Radar", "10.202.10.10"),
        DnsServer("Radar Alt", "10.202.10.11"),
        DnsServer("Electro", "78.157.42.100"),
        DnsServer("Electro Alt", "78.157.42.101"),
        DnsServer("Shecan", "178.22.122.100"),
        DnsServer("Shecan Alt", "185.51.200.2"),
        DnsServer("Begzar", "185.55.226.26"),
        DnsServer("Begzar Alt", "185.55.225.25"),
        DnsServer("403.online", "10.202.10.202"),
        DnsServer("403.online Alt", "10.202.10.102"),
        DnsServer("Shatel", "85.15.1.14"),
        DnsServer("Shatel Alt", "85.15.1.15"),
        DnsServer("Asiatech", "185.25.176.44"),
        DnsServer("Pishgaman", "5.200.200.200")
    )

    private fun buildDnsQuery(domain: String): ByteArray {
        val output = ByteArrayOutputStream()
        val dos = DataOutputStream(output)
        
        dos.writeShort(0x1234) // ID
        dos.writeShort(0x0100) // Flags: Standard query
        dos.writeShort(0x0001) // Questions: 1
        dos.writeShort(0x0000) // Answer RRs
        dos.writeShort(0x0000) // Authority RRs
        dos.writeShort(0x0000) // Additional RRs
        
        val parts = domain.split(".")
        for (part in parts) {
            dos.writeByte(part.length)
            dos.writeBytes(part)
        }
        dos.writeByte(0) 
        dos.writeShort(0x0001) // Type A
        dos.writeShort(0x0001) // Class IN
        
        return output.toByteArray()
    }

    private fun measureSingleDnsDelay(serverIp: String, domain: String, timeoutMs: Int = 3000): Pair<Long, Boolean> {
        val query = buildDnsQuery(domain)
        var socket: DatagramSocket? = null
        return try {
            socket = DatagramSocket()
            socket.soTimeout = timeoutMs
            val address = InetAddress.getByName(serverIp)
            val packet = DatagramPacket(query, query.size, address, 53)
            
            val start = System.currentTimeMillis()
            socket.send(packet)
            
            val buf = ByteArray(512)
            val response = DatagramPacket(buf, buf.size)
            socket.receive(response)
            
            val delay = System.currentTimeMillis() - start
            var isAccurate = false
            if (response.length >= 12) {
                val data = response.data
                val rcode = data[3].toInt() and 0x0F
                val answerCount = ((data[6].toInt() and 0xFF) shl 8) or (data[7].toInt() and 0xFF)
                if (rcode == 0 && answerCount > 0) {
                    isAccurate = true
                }
            }
            Pair(delay, isAccurate)
        } catch (e: Exception) {
            Pair(-1L, false)
        } finally {
            socket?.close()
        }
    }

    suspend fun benchmarkDns(
        servers: List<DnsServer>,
        testDomain: String = "www.google.com",
        pingsPerServer: Int = 5,
        onProgress: ((done: Int, total: Int) -> Unit)? = null
    ): List<DnsTestResult> = withContext(Dispatchers.IO) {
        var done = 0
        val total = servers.size
        servers.map { server ->
            val delays = mutableListOf<Long>()
            var accurateAnswers = 0
            for (i in 0 until pingsPerServer) {
                val (delay, isAccurate) = measureSingleDnsDelay(server.ip, testDomain)
                if (delay > 0) delays.add(delay)
                if (isAccurate) accurateAnswers++
            }
            
            val packetLoss = ((1.0 - (delays.size.toDouble() / pingsPerServer)) * 100).toInt()
            val avgPing = if (delays.isNotEmpty()) delays.average().toLong() else -1L
            val accuracy = ((accurateAnswers.toDouble() / pingsPerServer) * 100).toInt()
            val jitter = if (delays.size > 1) {
                var maxDiff = 0L
                for (i in 0 until delays.size - 1) {
                    val diff = Math.abs(delays[i] - delays[i + 1])
                    if (diff > maxDiff) maxDiff = diff
                }
                maxDiff
            } else 0L

            done++
            onProgress?.invoke(done, total)
            DnsTestResult(server, avgPing, packetLoss, jitter, accuracy)
        }.sortedBy { 
            if (it.packetLoss == 100 || it.accuracy == 0) Long.MAX_VALUE 
            else (it.packetLoss * 500L) + it.avgPing + (it.jitter * 2) - (it.accuracy * 2L)
        }
    }
}
