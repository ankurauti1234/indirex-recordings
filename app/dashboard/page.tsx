/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useId } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  CalendarIcon,
  FilterX,
  Play,
  Search,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  Filter,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import useSWR from "swr";
import { Suspense } from "react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const [channelId, setChannelId] = useState<string>("all");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [hour, setHour] = useState<string>("all");
  const [view, setView] = useState<"grid" | "table">("grid");
  const [page, setPage] = useState(1);
  const router = useRouter();
  const channelSelectId = useId();
  const hourSelectId = useId();

  const { data: channelsData } = useSWR("/api/channels", fetcher);
  const channels = Array.isArray(channelsData) ? channelsData : [];

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (channelId !== "all") params.append("channelId", channelId);
    if (date) params.append("date", format(date, "yyyy-MM-dd"));
    if (hour !== "all") params.append("hour", hour);
    params.append("page", page.toString());
    params.append("limit", "12");
    return params.toString();
  };

  const { data: response, isLoading } = useSWR(
    `/api/recordings?${buildQuery()}`,
    fetcher
  );
  const recordings = response?.data || [];
  const totalPages = response?.totalPages || 1;

  const clearFilters = () => {
    setChannelId("all");
    setDate(undefined);
    setHour("all");
    setPage(1);
  };

  const hasActiveFilters =
    channelId !== "all" || date !== undefined || hour !== "all";

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-2">
        <div>
          <h1 className="text-3xl tracking-tight">Recordings</h1>
          <p className="text-muted-foreground text-sm">
            Manage and view your channel recordings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9">
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-2 flex h-2 w-2 rounded-full bg-primary" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-fit">
              <DropdownMenuLabel>Filter Recordings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">
                    Channel
                  </label>
                  <Select
                    value={channelId}
                    onValueChange={(v) => {
                      setChannelId(v);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger
                      className="ps-2 [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_img]:shrink-0 w-full"
                      id={channelSelectId}
                    >
                      <SelectValue placeholder="All Channels" />
                    </SelectTrigger>
                    <SelectContent className="[&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8">
                      <SelectGroup>
                        <SelectItem value="all">
                          <span className="truncate">All Channels</span>
                        </SelectItem>
                        {channels.map((c: any) => (
                          <SelectItem key={c.id} value={c.id.toString()}>
                            {c.logoUrl ? (
                              <img
                                alt={c.name}
                                className="size-5 rounded shrink-0 border"
                                height={20}
                                width={20}
                                src={c.logoUrl}
                                onError={(e) => {
                                  // Fallback to initial if image fails to load
                                  e.currentTarget.style.display = "none";
                                  e.currentTarget.nextElementSibling?.classList.remove(
                                    "hidden"
                                  );
                                }}
                              />
                            ) : null}
                            <div
                              className={cn(
                                "size-5 rounded bg-muted flex items-center justify-center text-[10px] font-semibold",
                                c.logoUrl ? "hidden" : ""
                              )}
                            >
                              {c.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="truncate">{c.name}</span>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-muted-foreground">
                      Date
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? (
                            format(date, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={date}
                          onSelect={(d) => {
                            setDate(d);
                            setPage(1);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-muted-foreground">
                      Hour
                    </label>
                    <Select
                      value={hour}
                      onValueChange={(v) => {
                        setHour(v);
                        setPage(1);
                      }}
                    >
                      <SelectTrigger
                        className="relative ps-9 w-full"
                        id={hourSelectId}
                      >
                        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 group-has-[select[disabled]]:opacity-50">
                          <Clock aria-hidden="true" size={16} />
                        </div>
                        <SelectValue placeholder="Any Hour" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Hour</SelectItem>
                        {Array.from({ length: 24 }).map((_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {i.toString().padStart(2, "0")}:00 -{" "}
                            {i.toString().padStart(2, "0")}:59
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {hasActiveFilters && (
                  <>
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="w-full"
                    >
                      <FilterX className="w-4 h-4 mr-2" />
                      Clear Filters
                    </Button>
                  </>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Tabs value={view} onValueChange={(v: any) => setView(v as any)}>
            <TabsList>
              <TabsTrigger value="grid">
                <LayoutGrid className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="table">
                <List className="w-4 h-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : recordings.length > 0 ? (
        <div className="space-y-6">
          {view === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recordings.map((recording: any) => (
                <Card
                  key={recording.id}
                  className="group overflow-hidden border-muted hover:border-primary/50 transition-all cursor-pointer bg-card/50 gap-0 p-0"
                  onClick={() => router.push(`/player/${recording.id}`)}
                >
                  {/* Thumbnail / Poster Area */}
                  <div className="relative aspect-video bg-black/50 overflow-hidden">
                    {/* Subtle video preview underneath */}
                    <video
                      src={recording.videoUrl}
                      className="absolute inset-0 w-full h-full object-cover opacity-75"
                      preload="metadata"
                      muted
                      loop
                      playsInline
                    />

                    {/* Play overlay on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-background text-primary-foreground p-3 rounded-full scale-90 group-hover:scale-100 transition-transform">
                        <Play className="w-6 h-6 fill-foreground text-foreground" />
                      </div>
                    </div>

                    {/* Hour badge */}
                    <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur text-white text-[10px] px-2 py-0.5 rounded font-medium">
                      {recording.hour.toString().padStart(2, "0")}:00
                    </div>
                  </div>

                  {/* Card Header with Logo + Title */}
                  <CardHeader className="p-4 pb-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Channel Logo */}
                        {recording.logoUrl ? (
                          <img
                            src={recording.logoUrl}
                            alt={recording.channelName}
                            className="size-10 rounded-full shrink-0 border border-border"
                            onError={(e) =>
                              (e.currentTarget.style.display = "none")
                            }
                          />
                        ) : (
                          <div className="size-8 rounded bg-muted flex items-center justify-center text-xs font-semibold shrink-0">
                            {recording.channelName.charAt(0).toUpperCase()}
                          </div>
                        )}

                        {/* Title and Genre */}
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-base line-clamp-1">
                            {recording.channelName}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
                            {recording.genreName}
                          </p>
                        </div>
                      </div>

                      {/* Date */}
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(
                          new Date(recording.recordingDate),
                          "MMM dd yyyy"
                        )}
                      </span>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden bg-card/50">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-muted-foreground uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-6 py-3">Channel</th>
                    <th className="px-6 py-3">Genre</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3 text-right">Hour</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted">
                  {recordings.map((recording: any) => (
                    <tr
                      key={recording.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      <td className="px-6 py-4 font-medium">
                        {recording.channelName}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {recording.genreName}
                      </td>
                      <td className="px-6 py-4">
                        {format(
                          new Date(recording.recordingDate),
                          "MMM dd, yyyy"
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {recording.hour.toString().padStart(2, "0")}:00
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => router.push(`/player/${recording.id}`)}
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between py-4">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-card/50 rounded-xl border border-dashed">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <h3 className="text-lg font-medium">No recordings found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters to find what you&apos;re looking for.
          </p>
        </div>
      )}
    </div>
  );
}
