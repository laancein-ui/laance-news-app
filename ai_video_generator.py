# POWERFUL AI VIDEO + VOICE + AUTO SCENES GENERATOR
# pip install moviepy gtts pillow numpy

from moviepy.editor import *
from gtts import gTTS
from PIL import Image, ImageDraw, ImageFont
import numpy as np
import uuid
import os
import random

WIDTH, HEIGHT = 1280, 720

COLORS = [
    (10,10,10), (30,30,60), (0,40,80), (20,20,20)
]

def make_frame(text, bg):
    img = Image.new("RGB", (WIDTH, HEIGHT), bg)
    draw = ImageDraw.Draw(img)
    font = ImageFont.load_default()

    words = text.split()
    lines = []
    line = ""

    for w in words:
        test = line + " " + w if line else w
        if draw.textlength(test, font=font) < WIDTH - 120:
            line = test
        else:
            lines.append(line)
            line = w
    lines.append(line)

    y = HEIGHT//2 - len(lines)*20

    for l in lines:
        w = draw.textlength(l, font=font)
        draw.text(((WIDTH-w)/2, y), l, fill=(255,255,255), font=font)
        y += 40

    return np.array(img)

def ai_video(text, output="POWER_AI_VIDEO.mp4"):
    uid = str(uuid.uuid4())
    audio = uid + ".mp3"

    # AI VOICE
    tts = gTTS(text)
    tts.save(audio)

    # SPLIT INTO SCENES
    scenes = [s.strip() for s in text.split(".") if s.strip()]

    clips = []

    for s in scenes:
        bg = random.choice(COLORS)
        frame = make_frame(s, bg)
        clip = ImageClip(frame).set_duration(3)

        # ZOOM EFFECT (POWERFUL LOOK)
        clip = clip.resize(lambda t: 1 + 0.03*t)

        clips.append(clip)

    video = concatenate_videoclips(clips, method="compose")

    voice = AudioFileClip(audio)
    video = video.set_audio(voice)
    video = video.set_duration(voice.duration)

    video.write_videofile(output, fps=24)

    os.remove(audio)

    print("🔥 POWER AI VIDEO CREATED:", output)

# RUN AI
if __name__ == "__main__":
    text = "Artificial intelligence is powerful. It creates videos automatically. This is next generation AI system."
    ai_video(text)
