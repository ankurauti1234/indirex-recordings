-- Seeding initial data for genres and channels
INSERT INTO channel_genre ("genreName") VALUES ('Sports'), ('News'), ('Entertainment'), ('Music') ON CONFLICT DO NOTHING;

INSERT INTO channel (channel_id, name, "genreId") 
SELECT 'CH001', 'Sports Central', id FROM channel_genre WHERE "genreName" = 'Sports' ON CONFLICT DO NOTHING;

INSERT INTO channel (channel_id, name, "genreId") 
SELECT 'CH002', 'Global News', id FROM channel_genre WHERE "genreName" = 'News' ON CONFLICT DO NOTHING;

INSERT INTO video_recording ("recordingDate", hour, "videoUrl", "channelId")
SELECT '2025-12-30', 10, 'https://www.w3schools.com/html/mov_bbb.mp4', id FROM channel WHERE channel_id = 'CH001' ON CONFLICT DO NOTHING;
