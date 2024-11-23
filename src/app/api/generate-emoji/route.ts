import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          prompt: prompt,
          width: 512,
          height: 512,
          refine: "expert_ensemble_refiner",
          scheduler: "K_EULER",
          num_outputs: 1,
          guidance_scale: 7.5,
          apply_watermark: false,
          high_noise_frac: 0.8,
          negative_prompt: "text, watermark, low quality, blurry",
        },
      }
    );

    return NextResponse.json({ url: output[0] });
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.error();
  }
}
