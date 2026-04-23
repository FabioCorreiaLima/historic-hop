
ALTER TABLE public.questions
ADD COLUMN image_url TEXT,
ADD COLUMN audio_url TEXT,
ADD COLUMN video_url TEXT,
ADD COLUMN media_type TEXT NOT NULL DEFAULT 'text';
