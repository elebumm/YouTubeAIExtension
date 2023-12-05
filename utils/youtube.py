import os.path
from typing import List

import pysrt
from yt_dlp import YoutubeDL
import webvtt

from models import FixedSubs
from utils.database import embed_transcript



def transcribe_audio_with_deepgram():
    pass


def concatenate_subtitles(youtube_id: str, subtitles: List[webvtt.Caption], cue_group_size: int = 8) -> List[FixedSubs]:
    concat_subs = []

    temp_sub = ""
    start_time = ""
    for i, sub in enumerate(subtitles):

        if i % cue_group_size == 0:
            start_time = sub.start

        temp_sub += sub.text + " "
        if (i + 1) % cue_group_size == 0:
            concat_subs.append(
                FixedSubs(text=temp_sub.strip(), start_time=start_time)
            )
            temp_sub = ""

    if temp_sub:
        concat_subs.append(
            FixedSubs(text=temp_sub.strip(), start_time=start_time)
        )

    return concat_subs

def download_subtitles(youtube_id: str):

    ydl_opts = {
        'skip_download': True,  # Skip downloading the video
        'outtmpl': f'{youtube_id}',  # Output filename template
        "writesubtitles": True,
    }

    with YoutubeDL(ydl_opts) as ydl:
        ydl.download([f"https://www.youtube.com/watch?v={youtube_id}"])

    subtitle_file = f"{youtube_id}.en.vtt"

    if not os.path.exists(subtitle_file):

        ydl_opts_with_autosubs = {
            "skip_download": True,
            "outtmpl": f'{youtube_id}',
            'writeautomaticsub': True,
            'subtitleslangs': ['en'],  # Specify the language for auto subtitles
        }

        with YoutubeDL(ydl_opts_with_autosubs) as ydl:
            ydl.download([f"https://www.youtube.com/watch?v={youtube_id}"])

    subs = webvtt.read(subtitle_file)

    subs = concatenate_subtitles(youtube_id, subs)

    for sub in subs:
        print(sub)

    embed_transcript(subs, youtube_id)


