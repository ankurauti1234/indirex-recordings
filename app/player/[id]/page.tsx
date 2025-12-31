/* eslint-disable @next/next/no-img-element */
"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Clock, Info, Share2, Tag, Tv, Download } from "lucide-react"
import { format } from "date-fns"
import useSWR from "swr"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: recording, error, isLoading } = useSWR(`/api/recordings/${id}`, fetcher)

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: recording.channel.name,
        text: `Watch recording from ${recording.channel.name} on ${format(new Date(recording.recordingDate), "MMMM dd, yyyy")}`,
        url: window.location.href,
      }).catch(() => {
        fallbackCopy()
      })
    } else {
      fallbackCopy()
    }
  }

  const fallbackCopy = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success("Link copied to clipboard!")
  }

  const handleDownload = () => {
    if (!recording.videoUrl) {
      toast.error("Download link not available")
      return
    }

    toast.loading("Preparing download...", { id: "download-toast" })

    // Simulate or trigger actual download
    const link = document.createElement("a")
    link.href = recording.videoUrl
    link.download = `${recording.channel.name} - ${format(new Date(recording.recordingDate), "yyyy-MM-dd")} ${recording.hour.toString().padStart(2, "0")}_00.mp4`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.dismiss("download-toast")
    toast.success("Download started!")
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-8 space-y-6">
        <div className="h-10 w-24 bg-muted animate-pulse rounded-md" />
        <div className="aspect-video w-full bg-muted animate-pulse rounded-xl" />
        <div className="space-y-4">
          <div className="h-8 w-1/3 bg-muted animate-pulse rounded-md" />
          <div className="h-20 w-full bg-muted animate-pulse rounded-md" />
        </div>
      </div>
    )
  }

  if (error || !recording || recording.error) {
    return (
      <div className="container mx-auto p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold">Recording not found</h2>
        <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-2">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-muted">
            <video
              src={recording.videoUrl}
              controls
              autoPlay
              className="w-full h-full object-contain"
              // poster="/video-thumbnail.png"
            />
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <img
                            src={recording.channel.logoUrl}
                            alt={recording.channel.name}
                            className="h-12 shrink-0 rounded-md"
                            onError={(e) =>
                              (e.currentTarget.style.display = "none")
                            }
                          />
              <h1 className="text-2xl md:text-3xl tracking-tight">{recording.channel.name}</h1>
            </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={handleShare} aria-label="Share recording">
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" aria-label="More info">
                  <Info className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full">
                <Tv className="w-4 h-4" />
                <span className="font-medium text-foreground">{recording.channel.channelId}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(recording.recordingDate), "MMMM dd, yyyy")}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full">
                <Clock className="w-4 h-4" />
                <span>{recording.hour.toString().padStart(2, "0")}:00</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm border-muted p-0 gap-0">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                  About this Record
                </h3>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" />
                  <Badge variant="secondary" className="px-2.5 py-0.5 text-xs">
                    {recording.channel.genre.genreName}
                  </Badge>
                </div>
              </div>

              <div className="pt-4 border-t border-muted space-y-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Channel Name</p>
                  <p className="text-sm font-semibold">{recording.channel.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Recorded On</p>
                  <p className="text-sm font-semibold">
                    {format(new Date(recording.recordingDate), "EEEE, MMM do")} at {recording.hour}:00
                  </p>
                </div>
              </div>

              <Button className="w-full" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download Recording
              </Button>
            </CardContent>
          </Card>

          <div className="p-6 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
            <h4 className="text-sm font-bold flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              Quality Check
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This recording was captured in High Definition (1080p) at the scheduled time. Playback performance may
              vary based on your connection.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}