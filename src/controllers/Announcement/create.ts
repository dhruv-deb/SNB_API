import * as Utils from "src/utils";
import * as Interfaces from "src/interfaces";
import { prisma } from "src/utils";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const create: Interfaces.Controllers.Async = async (req, res, next) => {
  try {
    const { courseId, title, content } = req.body;
    if (!courseId || !title || !content) {
      return res.json(
        Utils.Response.error("courseId, title and content are required", 400)
      );
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return res.json(Utils.Response.error("Course not found", 404));
    }

    let attachmentUrl: string | null = null;

    if (req.file) {
      attachmentUrl = await Utils.uploadToS3(req.file);
    }

    const announcement = await prisma.announcement.create({
      data: {
        courseId,
        title,
        content,
        attachment: attachmentUrl,
      },
    });

    return res.json(Utils.Response.success(announcement));
  } catch (err) {
    return next(Utils.Response.error((err as Error).message, 500));
  }
};
export default [upload.single("attachment"), create];
