import { NextRequest, NextResponse } from "next/server";
import type {
  ApiResponse,
  ReferralFormData,
  ReferralRecord,
  ResumeParseResponse,
} from "@/lib/types/ReferalTypes/referalindex";

const apiReferral = {
  async getReferrals(req: NextRequest): Promise<NextResponse<ApiResponse<ReferralRecord[]>>> {
    try {
      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get("page") ?? "1", 10);
      const limit = parseInt(searchParams.get("limit") ?? "20", 10);

      return NextResponse.json(
        {
          success: true,
          data: [],
          message: `page=${page} limit=${limit}`,
        },
        { status: 200 }
      );
    } catch (err) {
      console.error("[GET referrals]", err);
      return NextResponse.json(
        { success: false, error: "Failed to fetch referrals." },
        { status: 500 }
      );
    }
  },

  async addReferral(req: NextRequest): Promise<NextResponse<ApiResponse<ReferralRecord>>> {
    try {
      const body: ReferralFormData = await req.json();

      const created: ReferralRecord = {
        ...body,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pipelineStage: "applied",
        status: "pending",
      };

      return NextResponse.json(
        {
          success: true,
          data: created,
          message: "Referral submitted successfully.",
        },
        { status: 201 }
      );
    } catch (err) {
      console.error("[ADD referral]", err);
      return NextResponse.json(
        { success: false, error: "Failed to create referral." },
        { status: 500 }
      );
    }
  },

  async parseResume(req: NextRequest): Promise<NextResponse<ResumeParseResponse>> {
    try {
      const formData = await req.formData();
      const file = formData.get("resume") as File | null;

      if (!file) {
        return NextResponse.json(
          { success: false, data: null, error: "No resume file provided." },
          { status: 400 }
        );
      }

      // TODO: integrate AI parser
      return NextResponse.json(
        { success: true, data: null },
        { status: 200 }
      );
    } catch (err) {
      console.error("[PARSE resume]", err);
      return NextResponse.json(
        { success: false, data: null, error: "Failed to parse resume." },
        { status: 500 }
      );
    }
  },
};

// ─────────────────────────────────────────────────────────────
// 🚀 Route Handlers (THIN)
// ─────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  return apiReferral.getReferrals(req);
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  if (action === "parse-resume") {
    return apiReferral.parseResume(req);
  }

  return apiReferral.addReferral(req);
}