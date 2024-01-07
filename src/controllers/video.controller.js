import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video

  if ([title, description].every((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const { _id } = req.user;
  const { videoFile, thumbnail: thumbnailFile } = req.files;

  if (!videoFile) {
    throw new ApiError(400, "Video file is required");
  }
  if (!thumbnailFile) {
    throw new ApiError(400, "Thumbnail is required");
  }

  const uploadedVideo = await uploadOnCloudinary(videoFile[0].path);
  const thumbnail = await uploadOnCloudinary(thumbnailFile[0].path);
  const { duration, url: videoUrl } = uploadedVideo;
  const { url: thumbnailUrl } = thumbnail;

  const video = await Video.create({
    title,
    description,
    owner: _id,
    duration,
    thumbnail: thumbnailUrl,
    videoFile: videoUrl,
  });

  return res
    .status(201)
    .json(new ApiResponse(200, video, "Video published Successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
