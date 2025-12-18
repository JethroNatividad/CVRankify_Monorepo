import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getMinioClient } from "~/lib/minio";
import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { env } from "~/env";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ applicantId: string }> },
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { applicantId } = await params;
    const applicantIdNum = parseInt(applicantId, 10);

    if (isNaN(applicantIdNum)) {
      return NextResponse.json(
        { error: "Invalid applicant ID" },
        { status: 400 },
      );
    }

    // Get applicant with job info to verify access
    const applicant = await db.applicant.findUnique({
      where: { id: applicantIdNum },
      include: {
        job: {
          select: { createdById: true },
        },
      },
    });

    if (!applicant) {
      return NextResponse.json(
        { error: "Applicant not found" },
        { status: 404 },
      );
    }

    // Verify the user owns the job this applicant applied to
    if (applicant.job.createdById !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!applicant.resume) {
      return NextResponse.json(
        { error: "No resume found for this applicant" },
        { status: 404 },
      );
    }

    // Get file from MinIO
    const minioClient = getMinioClient();
    const bucketName = env.MINIO_BUCKET_NAME;

    const dataStream = await minioClient.getObject(
      bucketName,
      applicant.resume,
    );

    // Get file stats for content-length
    const stat = await minioClient.statObject(bucketName, applicant.resume);

    // Determine content type from filename
    const extension = applicant.resume.split(".").pop()?.toLowerCase();
    let contentType = "application/octet-stream";
    if (extension === "pdf") {
      contentType = "application/pdf";
    } else if (extension === "doc") {
      contentType = "application/msword";
    } else if (extension === "docx") {
      contentType =
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    } else if (extension === "txt") {
      contentType = "text/plain";
    }

    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of dataStream) {
      chunks.push(chunk as Buffer);
    }
    const buffer = Buffer.concat(chunks);

    // Return the file with appropriate headers
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": stat.size.toString(),
        "Content-Disposition": `inline; filename="${applicant.resume.split("/").pop()}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error fetching resume:", error);
    return NextResponse.json(
      { error: "Failed to fetch resume" },
      { status: 500 },
    );
  }
}
