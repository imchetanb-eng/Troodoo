import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { v4 as uuidv4 } from "uuid";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";

if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    let x = Math.round(Number(formData.get("x")));
    let y = Math.round(Number(formData.get("y")));
    let w = Math.round(Number(formData.get("w")));
    let h = Math.round(Number(formData.get("h")));

    if (!file || isNaN(x) || isNaN(y) || isNaN(w) || isNaN(h)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
    const MAX_VIDEO_SIZE = 15 * 1024 * 1024; // 15MB

    const isVideo = file.type.startsWith('video/');
    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      return NextResponse.json({ error: "Video exceeds 15MB limit. Please compress to reduce server load." }, { status: 413 });
    } else if (!isVideo && file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: "Image exceeds 10MB limit." }, { status: 413 });
    }

    // Ensure parameters are valid for delogo (must be > 0 and within boundaries, but ffmpeg will throw if outside. We clamp minimums).
    w = Math.max(2, w);
    h = Math.max(2, h);
    x = Math.max(0, x);
    y = Math.max(0, y);

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileId = uuidv4();
    const ext = file.name.split('.').pop() || 'mp4';
    const inputPath = join(tmpdir(), `input_${fileId}.${ext}`);
    const outputPath = join(tmpdir(), `output_${fileId}.${ext}`);

    await writeFile(inputPath, buffer);

    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .videoFilters(`delogo=x=${x}:y=${y}:w=${w}:h=${h}`)
        .output(outputPath)
        .on("end", resolve)
        .on("error", (err, stdout, stderr) => {
          console.error("FFMPEG Error:", err);
          console.error("FFMPEG stderr:", stderr);
          reject(err);
        })
        .run();
    });

    const resultBuffer = await readFile(outputPath);
    
    // Clean up
    await unlink(inputPath).catch(console.error);
    await unlink(outputPath).catch(console.error);

    return new NextResponse(resultBuffer, {
      headers: {
        "Content-Type": file.type,
        "Content-Disposition": `attachment; filename="troodoo_${file.name}"`,
      },
    });
  } catch (error) {
    console.error("Processing error:", error);
    return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
  }
}
