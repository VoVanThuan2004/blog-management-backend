import cloudinary from "../config/cloudinary.js";
import type { UpdateUserDTO, UserProfile } from "../types/user.type.js";
import * as userRepo from "../repositories/user.repository.js";
import { AppError } from "../utils/app-error.js";

export async function getProfile(userId: string): Promise<UserProfile> {
  const user = await userRepo.findById(userId);

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return {
    userId: user.userId,
    fullName: user.fullName,
    avatar: user.avatar,
    gender: user.gender,
    dateOfBirth: user.dateOfBirth ?? null,
    roles: user.roles,
  };
}

export async function updateProfile(
  userId: string,
  dto: UpdateUserDTO,
  file?: Express.Multer.File,
): Promise<UserProfile> {
  const user = await userRepo.findById(userId);

  if (!user) {
    throw new AppError(404, "User not found");
  }

  let avatarUrl: string | undefined;
  let avatarPublicId: string | undefined;

  if (file) {
    if (user.avatarPublicId) {
      await cloudinary.uploader.destroy(user.avatarPublicId);
    }

    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "nodejs-blog-api" },
          (err, result) => {
            if (err || !result)
              reject(new AppError(500, "Failed to upload image"));
            else resolve(result);
          },
        );
        stream.end(file.buffer);
      },
    );
    avatarUrl = result.secure_url;
    avatarPublicId = result.public_id;
  }

  const updateData: Record<string, unknown> = {};
  if (dto.fullName !== undefined) updateData["fullName"] = dto.fullName;
  if (dto.gender !== undefined) updateData["gender"] = Number(dto.gender);
  if (dto.dateOfBirth !== undefined)
    updateData["dateOfBirth"] = new Date(dto.dateOfBirth);
  if (avatarUrl !== undefined) updateData["avatar"] = avatarUrl;
  if (avatarPublicId !== undefined)
    updateData["avatarPublicId"] = avatarPublicId;

  const updated = await userRepo.updateUser(userId, updateData);

  return {
    userId: updated.userId,
    fullName: updated.fullName,
    avatar: updated.avatar,
    gender: updated.gender,
    dateOfBirth: updated.dateOfBirth ?? null,
    roles: user.roles,
  };
}
