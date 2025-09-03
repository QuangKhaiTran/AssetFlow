   /* eslint-disable require-jsdoc */
import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/v2/https";
import {initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import {z} from "zod";

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();

// Set global options
setGlobalOptions({maxInstances: 10});

/**
 * Set CORS headers for the response
 * @param {any} res - Response object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setCorsHeaders = (res: any) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
};

// Schema definitions
const AddRoomSchema = z.object({
  name: z.string().min(1),
  managerName: z.string().min(1),
});

const UpdateRoomSchema = z.object({
  name: z.string().min(1).optional(),
  managerName: z.string().min(1).optional(),
});

const AddAssetSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().int().min(1),
  roomId: z.string().min(1),
});

const UpdateAssetStatusSchema = z.object({
  assetId: z.string().min(1),
  status: z.enum(["Đang sử dụng", "Đang sửa chữa", "Bị hỏng", "Đã thanh lý"]),
});

const MoveAssetSchema = z.object({
  assetId: z.string().min(1),
  newRoomId: z.string().min(1),
});

/**
 * Main API function
 */
export const api = onRequest(
  {cors: true},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (req: any, res: any) => {
    try {
      setCorsHeaders(res);

      if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
      }

      const {path, method, body} = req;
      const pathSegments = path.replace(/^\/api\//, "").split("/").filter(Boolean);
      
      logger.info(`API Request Received: ${method} ${path}`, {body, pathSegments});

      if (pathSegments.length === 0) {
        res.status(404).json({error: "API endpoint not found"});
        return;
      }
      
      const resource = pathSegments[0];
      const id = pathSegments[1];

      switch (resource) {
      case "rooms":
        if (method === "POST" && pathSegments.length === 1) {
            await addRoom(body, res);
        } else if (method === "PUT" && pathSegments.length === 2) {
            await updateRoom(id, body, res);
        } else if (method === "DELETE" && pathSegments.length === 2) {
            await deleteRoom(id, res);
        } else {
            res.status(404).json({error: `Invalid endpoint for resource 'rooms': ${method} ${path}`});
        }
        break;
      case "assets":
        if (method === "POST" && pathSegments.length === 1) {
            await addAsset(body, res);
        } else if (method === "PUT" && pathSegments[1] === "status") {
            await updateAssetStatus(body, res);
        } else if (method === "PUT" && pathSegments[1] === "move") {
            await moveAsset(body, res);
        } else {
            res.status(404).json({error: `Invalid endpoint for resource 'assets': ${method} ${path}`});
        }
        break;
      default:
        res.status(404).json({error: `Resource '${resource}' not found.`});
      }
    } catch (error) {
      logger.error("API Global Error:", error);
      res.status(500).json({error: "Internal server error"});
    }
  });

/**
 * Add a new room
 * @param {unknown} data - Request data
 * @param {any} res - Response object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function addRoom(data: unknown, res: any) {
  try {
    const validatedData = AddRoomSchema.parse(data);
    const {name, managerName} = validatedData;

    const docRef = await db.collection("rooms").add({
      name,
      managerName,
    });

    res.status(201).json({
      message: "Đã thêm phòng thành công.",
      id: docRef.id,
    });
  } catch (error) {
    logger.error("Error adding room:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({error: "Dữ liệu không hợp lệ.", details: error.errors});
    } else {
      res.status(500).json({error: "Không thể thêm phòng."});
    }
  }
}

/**
 * Update an existing room
 * @param {string} id - The ID of the room to update
 * @param {unknown} data - Request data
 * @param {any} res - Response object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function updateRoom(id: string, data: unknown, res: any) {
  try {
    const validatedData = UpdateRoomSchema.parse(data);
    if (Object.keys(validatedData).length === 0) {
      res.status(400).json({error: "No update data provided."});
      return;
    }

    await db.collection("rooms").doc(id).update(validatedData);

    res.status(200).json({
      message: "Cập nhật phòng thành công.",
    });
  } catch (error) {
    logger.error(`Error updating room ${id}:`, error);
    if (error instanceof z.ZodError) {
      res.status(400).json({error: "Dữ liệu không hợp lệ.", details: error.errors});
    } else {
      res.status(500).json({error: "Không thể cập nhật phòng."});
    }
  }
}

/**
 * Delete a room
 * @param {string} id - The ID of the room to delete
 * @param {any} res - Response object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function deleteRoom(id: string, res: any) {
  try {
    // Check if there are any assets in the room
    const assetsSnapshot = await db.collection("assets").where("roomId", "==", id).limit(1).get();
    if (!assetsSnapshot.empty) {
      res.status(400).json({error: "Không thể xóa phòng có chứa tài sản."});
      return;
    }

    await db.collection("rooms").doc(id).delete();

    res.status(200).json({
      message: "Xóa phòng thành công.",
    });
  } catch (error) {
    logger.error(`Error deleting room ${id}:`, error);
    res.status(500).json({error: "Không thể xóa phòng."});
  }
}

/**
 * Add a new asset
 * @param {unknown} data - Request data
 * @param {any} res - Response object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function addAsset(data: unknown, res: any) {
  try {
    const validatedData = AddAssetSchema.parse(data);
    const {name, quantity, roomId} = validatedData;

    const batch = db.batch();
    const newAssets: {id: string; name: string}[] = [];

    for (let i = 0; i < quantity; i++) {
      const assetRef = db.collection("assets").doc();
      const assetName = quantity > 1 ? `${name} #${i + 1}` : name;

      batch.set(assetRef, {
        name: assetName,
        roomId,
        status: "Đang sử dụng",
        dateAdded: new Date().toISOString().split("T")[0],
      });

      newAssets.push({id: assetRef.id, name: assetName});
    }

    await batch.commit();

    res.status(201).json({
      message: "Đã thêm tài sản thành công.",
      newAssets,
    });
  } catch (error) {
    logger.error("Error adding asset:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({error: "Dữ liệu không hợp lệ.", details: error.errors});
    } else {
      res.status(500).json({error: "Không thể thêm tài sản."});
    }
  }
}

/**
 * Update asset status
 * @param {unknown} data - Request data
 * @param {any} res - Response object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function updateAssetStatus(data: unknown, res: any) {
  try {
    const validatedData = UpdateAssetStatusSchema.parse(data);
    const {assetId, status} = validatedData;

    await db.collection("assets").doc(assetId).update({status});

    res.status(200).json({
      message: "Cập nhật trạng thái tài sản thành công.",
    });
  } catch (error) {
    logger.error("Error updating asset status:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({error: "Dữ liệu không hợp lệ.", details: error.errors});
    } else {
      res.status(500).json({error: "Không thể cập nhật trạng thái."});
    }
  }
}

/**
 * Move an asset to a different room
 * @param {unknown} data - Request data
 * @param {any} res - Response object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function moveAsset(data: unknown, res: any) {
  try {
    const validatedData = MoveAssetSchema.parse(data);
    const {assetId, newRoomId} = validatedData;

    await db.collection("assets").doc(assetId).update({roomId: newRoomId});

    res.status(200).json({
      message: "Di dời tài sản thành công.",
    });
  } catch (error) {
    logger.error("Error moving asset:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({error: "Dữ liệu không hợp lệ.", details: error.errors});
    } else {
      res.status(500).json({error: "Không thể di dời tài sản."});
    }
  }
}
