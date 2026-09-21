"use client";

import { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Swal from "sweetalert2";
import AdminNavbar from "@/app/components/AdminNavbar";
import {
  PageHeader,
  Panel,
  Pill,
  StatCard,
  Toolbar,
  type Tone,
} from "@/app/components/ui";
import {
  ACCEPT_IMAGES,
  deleteImage,
  listImages,
  uploadImage,
} from "@/lib/client-images";

type EquipmentStatus =
  | "available"
  | "borrowed"
  | "maintenance"
  | "inactive"
  | "damaged"
  | "lost";

type Equipment = {
  id: number;
  code: string;
  name: string;
  categoryId: number | null;
  category: string;
  location: string;
  status: EquipmentStatus;
  quantity: number;
  availableQuantity: number;
  description: string;
  purchaseDate: string | null;
  imageUrl: string | null;
};

type HistoryStatus =
  | "รออนุมัติ"
  | "กำลังยืม"
  | "เกินกำหนด"
  | "คืนแล้ว"
  | "ยกเลิก";

type HistoryItem = {
  id: number;
  borrower: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  rawStatus: string;
  status: HistoryStatus;
};

type Category = {
  id: number;
  name: string;
  imageUrl: string | null;
};

// หมวดหมู่ในหน้าต่าง "จัดการหมวดหมู่" (มีจำนวนครุภัณฑ์)
type CategoryInfo = Category & {
  equipmentCount: number;
};

type CategoryRow = {
  id: number;
  name: string;
  image_url: string | null;
  equipment_count?: number;
};

// รูปในแกลเลอรีของฟอร์ม
//   id !== null → รูปที่บันทึกแล้ว (แก้ไขครุภัณฑ์)
//   file !== null → รูปที่เลือกไว้ รออัปโหลดหลังเพิ่มครุภัณฑ์สำเร็จ
type GalleryItem = {
  key: string;
  url: string;
  id: number | null;
  file: File | null;
};

const MAX_EQUIPMENT_IMAGES = 8;

const ALLOWED_IMAGE_TYPES = ACCEPT_IMAGES.split(",");

type EquipmentRow = {
  id: number;
  equipment_code: string;
  name: string;
  category_id: number | null;
  category_name: string | null;
  description: string | null;
  location: string | null;
  quantity: number;
  available_quantity: number;
  status: EquipmentStatus;
  purchase_date: string | null;
  image_url: string | null;
};

const STATUS_LABEL: Record<EquipmentStatus, string> = {
  available: "พร้อมใช้งาน",
  borrowed: "ถูกยืม",
  maintenance: "ซ่อมบำรุง",
  inactive: "ปิดใช้งาน",
  damaged: "ชำรุด",
  lost: "สูญหาย",
};

const STATUS_TONE: Record<EquipmentStatus, Tone> = {
  available: "emerald",
  borrowed: "amber",
  maintenance: "blue",
  inactive: "neutral",
  damaged: "rose",
  lost: "neutral",
};

const STATUS_ICON: Record<EquipmentStatus, string> = {
  available: "bi-check-circle",
  borrowed: "bi-clock",
  maintenance: "bi-tools",
  inactive: "bi-slash-circle",
  damaged: "bi-exclamation-octagon",
  lost: "bi-question-circle",
};

const HISTORY_TONE: Record<HistoryStatus, Tone> = {
  รออนุมัติ: "amber",
  กำลังยืม: "blue",
  เกินกำหนด: "rose",
  คืนแล้ว: "emerald",
  ยกเลิก: "neutral",
};

function formatPurchaseDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function todayLocal() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

const STATUS_OPTIONS = Object.keys(STATUS_LABEL) as EquipmentStatus[];

const emptyForm = {
  code: "",
  name: "",
  categoryId: "",
  location: "",
  status: "available" as EquipmentStatus,
  quantity: 1,
  description: "",
  purchaseDate: "",
};

async function requestJson(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    cache: "no-store",
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  const contentType = response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    throw new Error(
      `API ${url} ไม่ได้ส่ง JSON กลับมา (HTTP ${response.status})`
    );
  }

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "เกิดข้อผิดพลาด");
  }

  return result;
}

// id ของรูปจาก URL รูปแบบ /api/images/{id}
function imageIdFromUrl(url: string | null) {
  const id = Number(url?.split("/").pop());

  return Number.isInteger(id) && id > 0 ? id : null;
}

function getCategoryIcon(name: string) {
  const text = name.toLowerCase();

  if (/computer|laptop|คอม|โน้ตบุ๊ก/.test(text)) return "bi-laptop";
  if (/projector|โปรเจค|ฉายภาพ/.test(text)) return "bi-projector";
  if (/camera|กล้อง/.test(text)) return "bi-camera";
  if (/audio|เสียง|ลำโพง/.test(text)) return "bi-speaker";
  if (/network|เครือข่าย/.test(text)) return "bi-router";
  if (/office|สำนักงาน/.test(text)) return "bi-printer";

  return "bi-tag";
}

async function confirmAction(title: string, text: string) {
  const result = await Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "ยืนยัน",
    cancelButtonText: "ยกเลิก",
    confirmButtonColor: "#e11d48",
  });

  return result.isConfirmed;
}

function showWarnings(messages: string[]) {
  if (messages.length === 0) return;

  Swal.fire({
    title: "บางรายการไม่สำเร็จ",
    html: messages
      .map((m) =>
        m.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`)
      )
      .join("<br>"),
    icon: "warning",
    confirmButtonText: "ตกลง",
    confirmButtonColor: "#6f42c1",
  });
}

function showError(error: unknown) {
  Swal.fire({
    title: "ไม่สำเร็จ",
    text: error instanceof Error ? error.message : "เกิดข้อผิดพลาด",
    icon: "error",
    confirmButtonText: "ตกลง",
    confirmButtonColor: "#6f42c1",
  });
}

export default function AdminEquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ทั้งหมด");

  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [editingEquipment, setEditingEquipment] =
    useState<Equipment | null>(null);

  const [deleteEquipment, setDeleteEquipment] =
    useState<Equipment | null>(null);

  const [form, setForm] = useState(emptyForm);

  // แกลเลอรีรูปครุภัณฑ์ (สูงสุด 8 รูป, รูปแรก = รูปปก)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryBusy, setGalleryBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const galleryRequest = useRef(0);
  const galleryKey = useRef(0);

  // จัดการหมวดหมู่
  const [showCategories, setShowCategories] = useState(false);
  const [categoryList, setCategoryList] = useState<CategoryInfo[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState("");
  const [categoryBusy, setCategoryBusy] = useState<number | "new" | null>(
    null
  );
  const [newCategoryName, setNewCategoryName] = useState("");
  const [renameId, setRenameId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const categoryFileRef = useRef<HTMLInputElement>(null);
  const categoryUploadTarget = useRef<number | null>(null);

  const [historyEquipment, setHistoryEquipment] =
    useState<Equipment | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const historyRequest = useRef(0);

  /* =====================================================
     LOAD BORROW HISTORY (เรียกจาก click handler เท่านั้น)
  ===================================================== */

  const loadHistory = async (equipmentId: number) => {
    const requestId = ++historyRequest.current;

    setHistory([]);
    setHistoryError("");
    setHistoryLoading(true);

    try {
      const result = await requestJson(
        `/api/equipment/${equipmentId}/history`
      );

      if (requestId !== historyRequest.current) return;

      setHistory(
        Array.isArray(result.data?.history) ? result.data.history : []
      );
    } catch (error) {
      if (requestId !== historyRequest.current) return;

      console.error("LOAD HISTORY ERROR:", error);
      setHistoryError(
        error instanceof Error
          ? error.message
          : "ไม่สามารถโหลดประวัติการยืมได้"
      );
    } finally {
      if (requestId === historyRequest.current) {
        setHistoryLoading(false);
      }
    }
  };

  const openHistory = (item: Equipment) => {
    setHistoryEquipment(item);
    loadHistory(item.id);
  };

  const closeHistory = () => {
    historyRequest.current++;
    setHistoryLoading(false);
    setHistoryEquipment(null);
  };

  /* =====================================================
     LOAD EQUIPMENT
  ===================================================== */

  const loadEquipment = () =>
    requestJson("/api/admin/equipment")
      .then(applyEquipment)
      .catch((error) => {
        console.error("LOAD EQUIPMENT ERROR:", error);

        setError(
          error instanceof Error
            ? error.message
            : "ไม่สามารถโหลดข้อมูลครุภัณฑ์ได้"
        );
      })
      .finally(() => setLoading(false));

  const applyEquipment = (result: {
    data: EquipmentRow[];
    categories: CategoryRow[];
  }) => {
    setError("");

    setEquipment(
      result.data.map((row) => ({
        id: Number(row.id),
        code: row.equipment_code,
        name: row.name,
        categoryId:
          row.category_id === null ? null : Number(row.category_id),
        category: row.category_name || "ไม่ระบุประเภท",
        location: row.location || "",
        status: row.status,
        quantity: Number(row.quantity),
        availableQuantity: Number(row.available_quantity),
        description: row.description || "",
        purchaseDate: row.purchase_date || null,
        imageUrl: row.image_url || null,
      }))
    );

    setCategories(
      result.categories.map((c) => ({
        id: Number(c.id),
        name: c.name,
        imageUrl: c.image_url || null,
      }))
    );
  };

  useEffect(() => {
    loadEquipment();
  }, []);

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredEquipment = equipment.filter((item) => {
    const keyword = search.toLowerCase().trim();

    const matchSearch =
      item.name.toLowerCase().includes(keyword) ||
      item.code.toLowerCase().includes(keyword) ||
      item.category.toLowerCase().includes(keyword);

    const matchStatus =
      statusFilter === "ทั้งหมด" ||
      item.status === statusFilter;

    return matchSearch && matchStatus;
  });

  /* =====================================================
     OPEN ADD FORM
  ===================================================== */

  /* ---------------- gallery ---------------- */

  // ล้างแกลเลอรี + คืนหน่วยความจำของรูปตัวอย่างที่ยังไม่อัปโหลด
  const resetGallery = () => {
    galleryRequest.current++;

    gallery.forEach((item) => {
      if (item.file) URL.revokeObjectURL(item.url);
    });

    setGallery([]);
    setGalleryLoading(false);
    setGalleryBusy(false);
    setDragOver(false);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const loadGallery = (equipmentId: number) => {
    const requestId = ++galleryRequest.current;

    setGalleryLoading(true);

    listImages({ ownerType: "equipment", ownerId: equipmentId })
      .then((images) => {
        if (requestId !== galleryRequest.current) return;

        setGallery(
          images.map((image) => ({
            key: `img-${image.id}`,
            url: image.url,
            id: image.id,
            file: null,
          }))
        );
      })
      .catch((error) => {
        if (requestId !== galleryRequest.current) return;
        console.error("LOAD IMAGES ERROR:", error);
        showError(error);
      })
      .finally(() => {
        if (requestId === galleryRequest.current) {
          setGalleryLoading(false);
        }
      });
  };

  const addImages = async (list: FileList | File[] | null | undefined) => {
    const files = Array.from(list ?? []);

    if (fileInputRef.current) fileInputRef.current.value = "";
    if (files.length === 0 || galleryBusy || galleryLoading || saving) return;

    const warnings: string[] = [];
    const valid = files.filter((file) =>
      ALLOWED_IMAGE_TYPES.includes(file.type)
    );

    if (valid.length < files.length) {
      warnings.push(
        `ข้าม ${files.length - valid.length} ไฟล์ (รองรับเฉพาะ PNG, JPG หรือ WEBP)`
      );
    }

    const room = Math.max(0, MAX_EQUIPMENT_IMAGES - gallery.length);
    const accepted = valid.slice(0, room);

    if (valid.length > room) {
      warnings.push(
        `เพิ่มรูปได้สูงสุด ${MAX_EQUIPMENT_IMAGES} รูป (ข้าม ${
          valid.length - room
        } รูป)`
      );
    }

    // ครุภัณฑ์ใหม่ → เก็บไว้ในเครื่องก่อน แล้วอัปโหลดหลังบันทึกสำเร็จ
    if (!editingEquipment) {
      setGallery((prev) => [
        ...prev,
        ...accepted.map((file) => ({
          key: `new-${++galleryKey.current}`,
          url: URL.createObjectURL(file),
          id: null,
          file,
        })),
      ]);

      showWarnings(warnings);
      return;
    }

    // แก้ไขครุภัณฑ์ → อัปโหลดทันที
    const equipmentId = editingEquipment.id;
    const requestId = galleryRequest.current;

    setGalleryBusy(true);

    for (const file of accepted) {
      try {
        const image = await uploadImage({
          file,
          ownerType: "equipment",
          ownerId: equipmentId,
        });

        if (requestId !== galleryRequest.current) break;

        setGallery((prev) => [
          ...prev,
          { key: `img-${image.id}`, url: image.url, id: image.id, file: null },
        ]);
      } catch (error) {
        warnings.push(
          `${file.name}: ${
            error instanceof Error ? error.message : "อัปโหลดไม่สำเร็จ"
          }`
        );
      }
    }

    if (requestId === galleryRequest.current) setGalleryBusy(false);

    loadEquipment();
    showWarnings(warnings);
  };

  const removeGalleryImage = async (item: GalleryItem) => {
    if (item.file || item.id === null) {
      URL.revokeObjectURL(item.url);
      setGallery((prev) => prev.filter((x) => x.key !== item.key));
      return;
    }

    if (!(await confirmAction("ลบรูปนี้?", "รูปจะถูกลบออกจากระบบทันที"))) {
      return;
    }

    const requestId = galleryRequest.current;

    try {
      setGalleryBusy(true);
      await deleteImage(item.id);

      if (requestId === galleryRequest.current) {
        setGallery((prev) => prev.filter((x) => x.key !== item.key));
      }

      loadEquipment();
    } catch (error) {
      showError(error);
    } finally {
      if (requestId === galleryRequest.current) setGalleryBusy(false);
    }
  };

  const closeForm = () => {
    resetGallery();
    setShowForm(false);
    setEditingEquipment(null);
  };

  const openAddForm = () => {
    resetGallery();
    setEditingEquipment(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  /* =====================================================
     OPEN EDIT FORM
  ===================================================== */

  const openEditForm = (item: Equipment) => {
    setEditingEquipment(item);

    setForm({
      code: item.code,
      name: item.name,
      categoryId: item.categoryId ? String(item.categoryId) : "",
      location: item.location,
      status: item.status,
      quantity: item.quantity,
      description: item.description,
      purchaseDate: item.purchaseDate || "",
    });

    resetGallery();
    setShowForm(true);
    loadGallery(item.id);
    loadHistory(item.id);
  };

  /* =====================================================
     SAVE EQUIPMENT
  ===================================================== */

  const saveEquipment = async () => {
    if (
      !form.code.trim() ||
      !form.name.trim() ||
      !form.categoryId ||
      !form.location.trim()
    ) {
      showError(new Error("กรุณากรอกข้อมูลให้ครบถ้วน"));
      return;
    }

    if (form.quantity < 1) {
      showError(new Error("จำนวนครุภัณฑ์ต้องมากกว่า 0"));
      return;
    }

    if (form.purchaseDate && form.purchaseDate > todayLocal()) {
      showError(new Error("วันที่ซื้อไม่ถูกต้อง"));
      return;
    }

    try {
      setSaving(true);

      const result = await requestJson(
        editingEquipment
          ? `/api/admin/equipment/${editingEquipment.id}`
          : "/api/admin/equipment",
        {
          method: editingEquipment ? "PUT" : "POST",
          body: JSON.stringify({
            ...form,
            categoryId: Number(form.categoryId),
          }),
        }
      );

      // ครุภัณฑ์ใหม่ → อัปโหลดรูปที่เลือกไว้ตามลำดับ (รูปแรก = รูปปก)
      const pending = editingEquipment
        ? []
        : gallery.filter((item) => item.file);
      const newId = Number(result.id);
      const failed: string[] = [];

      if (pending.length > 0 && newId) {
        for (const item of pending) {
          try {
            await uploadImage({
              file: item.file as File,
              ownerType: "equipment",
              ownerId: newId,
            });
          } catch (error) {
            failed.push(
              `${item.file?.name}: ${
                error instanceof Error ? error.message : "อัปโหลดไม่สำเร็จ"
              }`
            );
          }
        }
      }

      closeForm();

      await loadEquipment();

      if (failed.length > 0) {
        showWarnings([
          "บันทึกข้อมูลครุภัณฑ์แล้ว แต่อัปโหลดรูปไม่สำเร็จ:",
          ...failed,
        ]);
      }
    } catch (error) {
      console.error("SAVE EQUIPMENT ERROR:", error);
      await loadEquipment().catch(() => {});
      showError(error);
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     DELETE
  ===================================================== */

  const openDeleteModal = (item: Equipment) => {
    setDeleteEquipment(item);
    setShowDelete(true);
  };

  const confirmDelete = async () => {
    if (!deleteEquipment) return;

    try {
      setSaving(true);

      await requestJson(
        `/api/admin/equipment/${deleteEquipment.id}`,
        { method: "DELETE" }
      );

      setDeleteEquipment(null);
      setShowDelete(false);

      await loadEquipment();
    } catch (error) {
      console.error("DELETE EQUIPMENT ERROR:", error);
      setShowDelete(false);
      showError(error);
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     CATEGORIES (เรียกจาก click handler เท่านั้น)
  ===================================================== */

  const loadCategories = () => {
    setCategoryLoading(true);
    setCategoryError("");

    return requestJson("/api/admin/categories")
      .then((result: { data: CategoryRow[] }) => {
        setCategoryList(
          result.data.map((row) => ({
            id: Number(row.id),
            name: row.name,
            imageUrl: row.image_url || null,
            equipmentCount: Number(row.equipment_count || 0),
          }))
        );
      })
      .catch((error) => {
        console.error("LOAD CATEGORIES ERROR:", error);
        setCategoryError(
          error instanceof Error ? error.message : "ไม่สามารถโหลดหมวดหมู่ได้"
        );
      })
      .finally(() => setCategoryLoading(false));
  };

  const openCategories = () => {
    setNewCategoryName("");
    setRenameId(null);
    setShowCategories(true);
    loadCategories();
  };

  const closeCategories = () => {
    setShowCategories(false);
    setRenameId(null);
  };

  // ทำงานกับหมวดหมู่ แล้วโหลดรายการหมวดหมู่ + ครุภัณฑ์ใหม่
  const runCategoryAction = async (
    busy: number | "new",
    action: () => Promise<unknown>
  ) => {
    try {
      setCategoryBusy(busy);
      await action();
      await Promise.all([loadCategories(), loadEquipment()]);
      return true;
    } catch (error) {
      showError(error);
      return false;
    } finally {
      setCategoryBusy(null);
    }
  };

  const addCategory = async () => {
    const name = newCategoryName.trim();

    if (!name) {
      showError(new Error("กรุณากรอกชื่อหมวดหมู่"));
      return;
    }

    const ok = await runCategoryAction("new", () =>
      requestJson("/api/admin/categories", {
        method: "POST",
        body: JSON.stringify({ name }),
      })
    );

    if (ok) setNewCategoryName("");
  };

  const saveRename = async (category: CategoryInfo) => {
    const name = renameValue.trim();

    if (!name) {
      showError(new Error("กรุณากรอกชื่อหมวดหมู่"));
      return;
    }

    if (name === category.name) {
      setRenameId(null);
      return;
    }

    const ok = await runCategoryAction(category.id, () =>
      requestJson("/api/admin/categories", {
        method: "PATCH",
        body: JSON.stringify({ id: category.id, name }),
      })
    );

    if (ok) setRenameId(null);
  };

  const removeCategory = async (category: CategoryInfo) => {
    if (
      !(await confirmAction(
        `ลบหมวดหมู่ “${category.name}”?`,
        "การลบไม่สามารถย้อนกลับได้"
      ))
    ) {
      return;
    }

    await runCategoryAction(category.id, () =>
      requestJson(`/api/admin/categories?id=${category.id}`, {
        method: "DELETE",
      })
    );
  };

  const pickCategoryImage = (categoryId: number) => {
    categoryUploadTarget.current = categoryId;
    categoryFileRef.current?.click();
  };

  const uploadCategoryImage = async (file: File | undefined) => {
    const categoryId = categoryUploadTarget.current;

    if (categoryFileRef.current) categoryFileRef.current.value = "";
    if (!file || !categoryId) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      showError(new Error("รองรับเฉพาะไฟล์ PNG, JPG หรือ WEBP"));
      return;
    }

    await runCategoryAction(categoryId, () =>
      uploadImage({
        file,
        ownerType: "category",
        ownerId: categoryId,
        maxSize: 800,
      })
    );
  };

  const removeCategoryImage = async (category: CategoryInfo) => {
    const imageId = imageIdFromUrl(category.imageUrl);

    if (!imageId) return;

    if (
      !(await confirmAction(
        "ลบรูปหมวดหมู่?",
        `รูปของหมวดหมู่ “${category.name}” จะถูกลบ`
      ))
    ) {
      return;
    }

    await runCategoryAction(category.id, () => deleteImage(imageId));
  };

  const getStatusTone = (status: EquipmentStatus): Tone =>
    STATUS_TONE[status] ?? "neutral";

  const getStatusIcon = (status: EquipmentStatus) =>
    STATUS_ICON[status] ?? "bi-circle";

  const countStatus = (status: EquipmentStatus) =>
    equipment.filter((x) => x.status === status).length;

  const renderHistory = () => {
    if (historyLoading) {
      return (
        <div className="eq-history-state">
          <div className="spinner-border spinner-border-sm text-secondary"></div>
          <div className="text-secondary mt-2">กำลังโหลดประวัติ...</div>
        </div>
      );
    }

    if (historyError) {
      const target = historyEquipment ?? editingEquipment;
      return (
        <div className="eq-history-state">
          <i className="bi bi-exclamation-triangle fs-4 text-danger"></i>
          <div className="fw-semibold mt-2">{historyError}</div>
          {target && (
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm mt-2"
              onClick={() => loadHistory(target.id)}
            >
              ลองใหม่
            </button>
          )}
        </div>
      );
    }

    if (history.length === 0) {
      return (
        <div className="eq-history-state">
          <i className="bi bi-inbox fs-4 text-secondary"></i>
          <div className="text-secondary mt-2">
            ยังไม่มีประวัติการยืมครุภัณฑ์นี้
          </div>
        </div>
      );
    }

    return (
      <div className="table-responsive eq-history">
        <table className="table table-sm align-middle ui-table mb-0">
          <thead>
            <tr>
              <th>ผู้ยืม</th>
              <th>วันเวลาที่ยืม</th>
              <th>กำหนดคืน</th>
              <th>วันที่คืน</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {history.map((row) => (
              <tr key={row.id}>
                <td className="fw-semibold">{row.borrower || "-"}</td>
                <td className="text-nowrap">{formatDateTime(row.borrowDate)}</td>
                <td className="text-nowrap">{formatDateTime(row.dueDate)}</td>
                <td className="text-nowrap">{formatDateTime(row.returnDate)}</td>
                <td>
                  <Pill tone={HISTORY_TONE[row.status] ?? "neutral"}>
                    {row.status}
                  </Pill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <main className="min-vh-100">

      <AdminNavbar />

      <section className="admin-page-content">

        <div className="ui-page p-0">

          {/* HEADER */}

          <PageHeader
            eyebrow="คลังครุภัณฑ์"
            title="จัดการครุภัณฑ์"
            description="เพิ่ม แก้ไข และติดตามสถานะครุภัณฑ์ทั้งหมดในระบบ"
            actions={
              <>
                <button
                  className="btn btn-outline-secondary"
                  onClick={openCategories}
                >
                  <i className="bi bi-tags me-2"></i>
                  จัดการหมวดหมู่
                </button>

                <button
                  className="btn btn-primary"
                  onClick={openAddForm}
                >
                  <i className="bi bi-plus-lg me-2"></i>
                  เพิ่มครุภัณฑ์
                </button>
              </>
            }
          />

          {/* STATISTICS */}

          <div className="row g-3">

            <div className="col-6 col-md-4 col-xl-2">
              <StatCard
                icon="bi-box-seam"
                label="ครุภัณฑ์ทั้งหมด"
                value={equipment.length}
                tone="purple"
              />
            </div>

            <div className="col-6 col-md-4 col-xl-2">
              <StatCard
                icon="bi-check-circle"
                label="พร้อมใช้งาน"
                value={countStatus("available")}
                tone="emerald"
              />
            </div>

            <div className="col-6 col-md-4 col-xl-2">
              <StatCard
                icon="bi-arrow-up-right-circle"
                label="ถูกยืม"
                value={countStatus("borrowed")}
                tone="amber"
              />
            </div>

            <div className="col-6 col-md-4 col-xl-2">
              <StatCard
                icon="bi-tools"
                label="ซ่อมบำรุง"
                value={countStatus("maintenance")}
                tone="blue"
              />
            </div>

            <div className="col-6 col-md-4 col-xl-2">
              <StatCard
                icon="bi-exclamation-octagon"
                label="ชำรุด"
                value={countStatus("damaged")}
                tone="rose"
              />
            </div>

            <div className="col-6 col-md-4 col-xl-2">
              <StatCard
                icon="bi-question-circle"
                label="สูญหาย"
                value={countStatus("lost")}
                tone="neutral"
              />
            </div>

          </div>

          {/* SEARCH / FILTER */}

          <Toolbar>

            <div className="input-group eq-search">

              <span className="input-group-text bg-white">
                <i className="bi bi-search text-secondary"></i>
              </span>

              <input
                type="text"
                className="form-control border-start-0"
                placeholder="ค้นหาชื่อ หรือรหัสครุภัณฑ์..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

            </div>

            <select
              className="form-select w-auto"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >
              <option>ทั้งหมด</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABEL[status]}
                </option>
              ))}
            </select>

            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => {
                setSearch("");
                setStatusFilter("ทั้งหมด");
              }}
            >
              <i className="bi bi-arrow-counterclockwise me-1"></i>
              รีเซ็ต
            </button>

          </Toolbar>

          {/* TABLE */}

          <Panel
            flush
            title="รายการครุภัณฑ์"
            description={
              <>
                แสดง <strong>{filteredEquipment.length}</strong> จาก{" "}
                <strong>{equipment.length}</strong> รายการ
              </>
            }
          >

            <div className="table-responsive">

              <table className="table align-middle ui-table eq-table">

                <thead>
                  <tr>
                    <th>ครุภัณฑ์</th>
                    <th>หมวดหมู่</th>
                    <th>วันที่ซื้อ</th>
                    <th>สถานที่</th>
                    <th>จำนวน</th>
                    <th>สถานะ</th>
                    <th className="text-end">
                      จัดการ
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {loading || error ? (

                    <tr>

                      <td
                        colSpan={7}
                        className="text-center py-5"
                      >

                        {loading ? (
                          <>
                            <div className="spinner-border spinner-border-sm text-secondary"></div>
                            <div className="text-secondary mt-2">
                              กำลังโหลดข้อมูล...
                            </div>
                          </>
                        ) : (
                          <>
                            <i className="bi bi-exclamation-triangle fs-3 text-danger"></i>
                            <div className="fw-semibold mt-2">
                              {error}
                            </div>
                            <button
                              className="btn btn-outline-secondary btn-sm mt-2"
                              onClick={() => {
                                setLoading(true);
                                loadEquipment();
                              }}
                            >
                              ลองใหม่
                            </button>
                          </>
                        )}

                      </td>

                    </tr>

                  ) : filteredEquipment.length > 0 ? (

                    filteredEquipment.map((item) => (

                      <tr key={item.id}>

                        {/* EQUIPMENT */}

                        <td>

                          <div className="d-flex align-items-center gap-3">

                            {item.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="eq-thumb"
                              />
                            ) : (
                              <div className="eq-icon">
                                <i className="bi bi-box-seam"></i>
                              </div>
                            )}

                            <div className="equipment-name-wrapper">

                              <div className="fw-semibold">
                                {item.name}
                              </div>

                              <small className="text-secondary">
                                {item.code}
                              </small>

                            </div>

                          </div>

                        </td>

                        {/* CATEGORY */}

                        <td>
                          <span className="text-secondary">
                            {item.category}
                          </span>
                        </td>

                        {/* PURCHASE DATE */}

                        <td className="text-nowrap">
                          <span className="text-secondary">
                            {formatPurchaseDate(item.purchaseDate)}
                          </span>
                        </td>

                        {/* LOCATION */}

                        <td>

                          <div className="d-flex align-items-center gap-2">

                            <i className="bi bi-geo-alt text-secondary"></i>

                            <span>
                              {item.location}
                            </span>

                          </div>

                        </td>

                        {/* QUANTITY */}

                        <td>

                          <span className="fw-semibold">
                            {item.availableQuantity}/{item.quantity}
                          </span>

                          <small className="text-secondary ms-1">
                            ชิ้น
                          </small>

                        </td>

                        {/* STATUS */}

                        <td>

                          <Pill tone={getStatusTone(item.status)}>
                            <i
                              className={`bi ${getStatusIcon(
                                item.status
                              )}`}
                            ></i>
                            {STATUS_LABEL[item.status]}
                          </Pill>

                        </td>

                        {/* ACTION */}

                        <td className="text-end">

                          <div className="d-flex justify-content-end gap-2">

                            <button
                              className="btn btn-sm eq-action"
                              title="ประวัติการยืม–คืน"
                              aria-label="ประวัติการยืม–คืน"
                              onClick={() => openHistory(item)}
                            >
                              <i className="bi bi-clock-history"></i>
                            </button>

                            <button
                              className="btn btn-sm eq-action"
                              title="แก้ไข"
                              onClick={() =>
                                openEditForm(item)
                              }
                            >
                              <i className="bi bi-pencil"></i>
                            </button>

                            <button
                              className="btn btn-sm eq-action danger"
                              title="ลบ"
                              onClick={() =>
                                openDeleteModal(item)
                              }
                            >
                              <i className="bi bi-trash"></i>
                            </button>

                          </div>

                        </td>

                      </tr>

                    ))

                  ) : (

                    <tr>

                      <td
                        colSpan={7}
                        className="text-center py-5"
                      >

                        <i className="bi bi-search fs-3 text-secondary"></i>

                        <div className="fw-semibold mt-2">
                          ไม่พบข้อมูลครุภัณฑ์
                        </div>

                        <small className="text-secondary">
                          ลองเปลี่ยนคำค้นหาหรือตัวกรอง
                        </small>

                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </Panel>

        </div>

      </section>

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {showForm && (

        <div
          className="equipment-modal-backdrop"
          onClick={closeForm}
        >

          <div
            className="equipment-modal-dialog"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="equipment-modal">

              {/* =================================================
                  MODAL HEADER
              ================================================= */}

              <div className="equipment-modal-header">

                <div>

                  <h5 className="mb-1 fw-bold">
                    {editingEquipment
                      ? "แก้ไขครุภัณฑ์"
                      : "เพิ่มครุภัณฑ์"}
                  </h5>

                  <small className="text-secondary">
                    {editingEquipment
                      ? "แก้ไขข้อมูลครุภัณฑ์"
                      : "เพิ่มข้อมูลครุภัณฑ์ใหม่เข้าสู่ระบบ"}
                  </small>

                </div>

                <button
                  type="button"
                  className="btn-close"
                  aria-label="ปิด"
                  onClick={closeForm}
                />

              </div>

              {/* =================================================
                  MODAL BODY
              ================================================= */}

              <div className="equipment-modal-body">

                <div className="row g-3">

                  {/* CODE */}

                  <div className="col-md-6">

                    <label className="form-label fw-semibold">
                      รหัสครุภัณฑ์
                      <span className="text-danger">*</span>
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="เช่น SOC-CAM-001"
                      value={form.code}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          code: e.target.value,
                        })
                      }
                    />

                  </div>

                  {/* NAME */}

                  <div className="col-md-6">

                    <label className="form-label fw-semibold">
                      ชื่อครุภัณฑ์
                      <span className="text-danger">*</span>
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="เช่น Digital Camera"
                      value={form.name}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          name: e.target.value,
                        })
                      }
                    />

                  </div>

                  {/* CATEGORY */}

                  <div className="col-md-6">

                    <label className="form-label fw-semibold">
                      หมวดหมู่
                      <span className="text-danger">*</span>
                    </label>

                    <select
                      className="form-select"
                      value={form.categoryId}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          categoryId: e.target.value,
                        })
                      }
                    >

                      <option value="">
                        เลือกหมวดหมู่
                      </option>

                      {categories.map((category) => (
                        <option
                          key={category.id}
                          value={category.id}
                        >
                          {category.name}
                        </option>
                      ))}

                    </select>

                  </div>

                  {/* LOCATION */}

                  <div className="col-md-6">

                    <label className="form-label fw-semibold">
                      สถานที่จัดเก็บ
                      <span className="text-danger">*</span>
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="เช่น ห้องโสตทัศนศึกษา"
                      value={form.location}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          location: e.target.value,
                        })
                      }
                    />

                  </div>

                  {/* QUANTITY */}

                  <div className="col-md-6">

                    <label className="form-label fw-semibold">
                      จำนวน
                    </label>

                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      value={form.quantity}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          quantity: Number(
                            e.target.value
                          ),
                        })
                      }
                    />

                  </div>

                  {/* STATUS */}

                  <div className="col-md-6">

                    <label className="form-label fw-semibold">
                      สถานะ
                    </label>

                    <select
                      className="form-select"
                      value={form.status}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          status:
                            e.target.value as EquipmentStatus,
                        })
                      }
                    >

                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABEL[status]}
                        </option>
                      ))}

                    </select>

                  </div>

                  {/* PURCHASE DATE */}

                  <div className="col-md-6">

                    <label className="form-label fw-semibold">
                      วันที่ซื้อ
                    </label>

                    <input
                      type="date"
                      className="form-control"
                      max={todayLocal()}
                      value={form.purchaseDate}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          purchaseDate: e.target.value,
                        })
                      }
                    />

                  </div>

                  {/* DESCRIPTION */}

                  <div className="col-12">

                    <label className="form-label fw-semibold">
                      รายละเอียด
                    </label>

                    <textarea
                      className="form-control equipment-description"
                      rows={3}
                      placeholder="รายละเอียดเพิ่มเติมของครุภัณฑ์..."
                      value={form.description}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          description: e.target.value,
                        })
                      }
                    />

                  </div>

                  {/* IMAGES (GALLERY) */}

                  <div className="col-12">

                    <div className="d-flex justify-content-between align-items-baseline mb-2">
                      <label className="form-label fw-semibold mb-0">
                        รูปภาพครุภัณฑ์
                      </label>
                      <small className="text-secondary">
                        {gallery.length}/{MAX_EQUIPMENT_IMAGES} รูป
                      </small>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ACCEPT_IMAGES}
                      multiple
                      className="d-none"
                      onChange={(e) => addImages(e.target.files)}
                    />

                    <div
                      className={`eq-gallery ${dragOver ? "drag" : ""}`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (!dragOver) setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        addImages(e.dataTransfer.files);
                      }}
                    >

                      {galleryLoading ? (
                        <div className="eq-gallery-state">
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          กำลังโหลดรูปภาพ...
                        </div>
                      ) : (
                        <>
                          {gallery.map((item, index) => (
                            <div key={item.key} className="eq-gallery-item">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={item.url} alt={`รูปที่ ${index + 1}`} />

                              {index === 0 && (
                                <span className="eq-gallery-cover">รูปปก</span>
                              )}

                              {item.file && (
                                <span className="eq-gallery-pending">
                                  รออัปโหลด
                                </span>
                              )}

                              <button
                                type="button"
                                className="eq-gallery-remove"
                                title="ลบรูป"
                                aria-label="ลบรูป"
                                disabled={galleryBusy || saving}
                                onClick={() => removeGalleryImage(item)}
                              >
                                <i className="bi bi-x-lg"></i>
                              </button>
                            </div>
                          ))}

                          {gallery.length < MAX_EQUIPMENT_IMAGES && (
                            <button
                              type="button"
                              className="eq-gallery-add"
                              disabled={galleryBusy || saving}
                              onClick={() => fileInputRef.current?.click()}
                            >
                              {galleryBusy ? (
                                <span className="spinner-border spinner-border-sm"></span>
                              ) : (
                                <i className="bi bi-cloud-arrow-up"></i>
                              )}
                              <small>
                                {galleryBusy ? "กำลังอัปโหลด..." : "เพิ่มรูป"}
                              </small>
                            </button>
                          )}
                        </>
                      )}

                    </div>

                    <small className="text-secondary d-block mt-2">
                      PNG, JPG หรือ WEBP · เลือกได้หลายไฟล์หรือลากมาวาง ·
                      รูปแรกจะเป็นรูปปก
                      {editingEquipment
                        ? " · เพิ่ม/ลบรูปมีผลทันที"
                        : " · รูปจะถูกอัปโหลดเมื่อกด “เพิ่มครุภัณฑ์”"}
                    </small>

                  </div>

                  {/* BORROW HISTORY (edit only) */}

                  {editingEquipment && (
                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        ประวัติการยืม–คืน
                      </label>
                      {renderHistory()}
                    </div>
                  )}

                </div>

              </div>

              {/* =================================================
                  MODAL FOOTER
              ================================================= */}

              <div className="equipment-modal-footer">

                <button
                  className="btn btn-outline-secondary px-4"
                  onClick={closeForm}
                >
                  {editingEquipment ? "ปิด" : "ยกเลิก"}
                </button>

                <button
                  className="btn btn-primary px-4"
                  onClick={saveEquipment}
                  disabled={saving}
                >

                  <i className="bi bi-check-lg me-2"></i>

                  {editingEquipment
                    ? "บันทึกการแก้ไข"
                    : "เพิ่มครุภัณฑ์"}

                </button>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          HISTORY MODAL
      ===================================================== */}

      {historyEquipment && (

        <div
          className="equipment-modal-backdrop"
          onClick={closeHistory}
        >

          <div
            className="equipment-modal-dialog"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="equipment-modal">

              <div className="equipment-modal-header">

                <div>
                  <h5 className="mb-1 fw-bold">
                    ประวัติการยืม–คืน
                  </h5>
                  <small className="text-secondary">
                    {historyEquipment.name} · {historyEquipment.code}
                  </small>
                </div>

                <button
                  type="button"
                  className="btn-close"
                  aria-label="ปิด"
                  onClick={closeHistory}
                />

              </div>

              <div className="equipment-modal-body">
                {renderHistory()}
              </div>

              <div className="equipment-modal-footer">
                <button
                  className="btn btn-outline-secondary px-4"
                  onClick={closeHistory}
                >
                  ปิด
                </button>
              </div>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          CATEGORY MODAL
      ===================================================== */}

      {showCategories && (

        <div
          className="equipment-modal-backdrop"
          onClick={closeCategories}
        >

          <div
            className="equipment-modal-dialog"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="equipment-modal">

              <div className="equipment-modal-header">

                <div>
                  <h5 className="mb-1 fw-bold">
                    จัดการหมวดหมู่
                  </h5>
                  <small className="text-secondary">
                    เพิ่ม เปลี่ยนชื่อ ลบ และกำหนดรูปของแต่ละหมวดหมู่
                  </small>
                </div>

                <button
                  type="button"
                  className="btn-close"
                  aria-label="ปิด"
                  onClick={closeCategories}
                />

              </div>

              <div className="equipment-modal-body">

                <input
                  ref={categoryFileRef}
                  type="file"
                  accept={ACCEPT_IMAGES}
                  className="d-none"
                  onChange={(e) => uploadCategoryImage(e.target.files?.[0])}
                />

                {/* ADD */}

                <form
                  className="d-flex gap-2 mb-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    addCategory();
                  }}
                >
                  <input
                    type="text"
                    className="form-control"
                    placeholder="ชื่อหมวดหมู่ใหม่"
                    maxLength={100}
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary text-nowrap"
                    disabled={categoryBusy !== null}
                  >
                    {categoryBusy === "new" ? (
                      <span className="spinner-border spinner-border-sm me-2"></span>
                    ) : (
                      <i className="bi bi-plus-lg me-2"></i>
                    )}
                    เพิ่มหมวดหมู่
                  </button>
                </form>

                {/* LIST */}

                <Panel flush>
                  {categoryLoading && categoryList.length === 0 ? (
                    <div className="eq-cat-state">
                      <div className="spinner-border spinner-border-sm text-secondary"></div>
                      <div className="text-secondary mt-2">กำลังโหลดหมวดหมู่...</div>
                    </div>
                  ) : categoryError ? (
                    <div className="eq-cat-state">
                      <i className="bi bi-exclamation-triangle fs-4 text-danger"></i>
                      <div className="fw-semibold mt-2">{categoryError}</div>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm mt-2"
                        onClick={loadCategories}
                      >
                        ลองใหม่
                      </button>
                    </div>
                  ) : categoryList.length === 0 ? (
                    <div className="eq-cat-state">
                      <i className="bi bi-inbox fs-4 text-secondary"></i>
                      <div className="text-secondary mt-2">ยังไม่มีหมวดหมู่</div>
                    </div>
                  ) : (
                    categoryList.map((category) => {
                      const busy = categoryBusy === category.id;
                      const locked = categoryBusy !== null;

                      return (
                        <div key={category.id} className="eq-cat-row">

                          <div className="eq-cat-thumb">
                            {busy ? (
                              <span className="spinner-border spinner-border-sm"></span>
                            ) : category.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={category.imageUrl} alt={category.name} />
                            ) : (
                              <i className={`bi ${getCategoryIcon(category.name)}`}></i>
                            )}
                          </div>

                          <div className="flex-grow-1 eq-cat-text">
                            {renameId === category.id ? (
                              <form
                                className="d-flex gap-2"
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  saveRename(category);
                                }}
                              >
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  maxLength={100}
                                  autoFocus
                                  value={renameValue}
                                  onChange={(e) => setRenameValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Escape") setRenameId(null);
                                  }}
                                />
                                <button
                                  type="submit"
                                  className="btn btn-sm btn-primary"
                                  disabled={locked}
                                  title="บันทึกชื่อ"
                                  aria-label="บันทึกชื่อ"
                                >
                                  <i className="bi bi-check-lg"></i>
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => setRenameId(null)}
                                  title="ยกเลิก"
                                  aria-label="ยกเลิก"
                                >
                                  <i className="bi bi-x-lg"></i>
                                </button>
                              </form>
                            ) : (
                              <>
                                <div className="fw-semibold text-truncate">
                                  {category.name}
                                </div>
                                <small className="text-secondary">
                                  ครุภัณฑ์ {category.equipmentCount} รายการ
                                  {category.imageUrl ? " · มีรูป" : " · ยังไม่มีรูป"}
                                </small>
                              </>
                            )}
                          </div>

                          {renameId !== category.id && (
                            <div className="d-flex gap-1 flex-shrink-0">
                              <button
                                type="button"
                                className="btn btn-sm eq-action"
                                title={category.imageUrl ? "เปลี่ยนรูป" : "อัปโหลดรูป"}
                                aria-label={category.imageUrl ? "เปลี่ยนรูป" : "อัปโหลดรูป"}
                                disabled={locked}
                                onClick={() => pickCategoryImage(category.id)}
                              >
                                <i className="bi bi-image"></i>
                              </button>

                              {category.imageUrl && (
                                <button
                                  type="button"
                                  className="btn btn-sm eq-action danger"
                                  title="ลบรูป"
                                  aria-label="ลบรูป"
                                  disabled={locked}
                                  onClick={() => removeCategoryImage(category)}
                                >
                                  <i className="bi bi-file-earmark-x"></i>
                                </button>
                              )}

                              <button
                                type="button"
                                className="btn btn-sm eq-action"
                                title="เปลี่ยนชื่อ"
                                aria-label="เปลี่ยนชื่อ"
                                disabled={locked}
                                onClick={() => {
                                  setRenameId(category.id);
                                  setRenameValue(category.name);
                                }}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>

                              <button
                                type="button"
                                className="btn btn-sm eq-action danger"
                                title={
                                  category.equipmentCount > 0
                                    ? "ลบไม่ได้ เพราะมีครุภัณฑ์ในหมวดหมู่นี้"
                                    : "ลบหมวดหมู่"
                                }
                                aria-label="ลบหมวดหมู่"
                                disabled={locked || category.equipmentCount > 0}
                                onClick={() => removeCategory(category)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          )}

                        </div>
                      );
                    })
                  )}
                </Panel>

                <small className="text-secondary d-block mt-2">
                  รูปหมวดหมู่จะแสดงแทนครุภัณฑ์ที่ยังไม่มีรูป · ลบได้เฉพาะหมวดหมู่ที่ไม่มีครุภัณฑ์
                </small>

              </div>

              <div className="equipment-modal-footer">
                <button
                  className="btn btn-outline-secondary px-4"
                  onClick={closeCategories}
                >
                  ปิด
                </button>
              </div>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {showDelete && deleteEquipment && (

        <div
          className="equipment-modal-backdrop equipment-delete-backdrop"
          onClick={() => setShowDelete(false)}
        >

          <div
            className="equipment-delete-dialog"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="equipment-modal">

              <div className="p-4 p-md-5 text-center">

                {/* ICON */}

                <div className="delete-icon mx-auto mb-4">

                  <i className="bi bi-trash fs-4"></i>

                </div>

                <h4 className="fw-bold mb-2">
                  ยืนยันการลบ?
                </h4>

                <p className="text-secondary mb-1">
                  คุณต้องการลบครุภัณฑ์
                </p>

                <div className="fw-bold fs-5">
                  {deleteEquipment.name}
                </div>

                <small className="text-secondary">
                  {deleteEquipment.code}
                </small>

                <div className="alert alert-danger text-start mt-4 mb-0">

                  <i className="bi bi-exclamation-triangle me-2"></i>

                  การลบข้อมูลไม่สามารถย้อนกลับได้

                </div>

                <div className="d-flex gap-2 mt-4">

                  <button
                    className="btn btn-outline-secondary flex-grow-1"
                    onClick={() => setShowDelete(false)}
                  >
                    ยกเลิก
                  </button>

                  <button
                    className="btn btn-danger flex-grow-1"
                    onClick={confirmDelete}
                    disabled={saving}
                  >
                    <i className="bi bi-trash me-2"></i>
                    ยืนยันลบ
                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>

      )}
      <style jsx>{`
        .eq-search {
          flex: 1 1 240px;
          max-width: 420px;
        }

        .eq-table {
          min-width: 920px;
        }

        .eq-history-state {
          padding: 24px 12px;
          text-align: center;
          border: 1px dashed #e4e4e4;
          border-radius: 8px;
        }

        .eq-history {
          max-height: 320px;
          overflow-y: auto;
          border: 1px solid #e4e4e4;
          border-radius: 8px;
        }

        .eq-history table {
          min-width: 560px;
        }

        .eq-table > tbody > tr > td {
          background: transparent;
        }

        .eq-icon {
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: #f3efff;
          color: #6f42c1;
          font-size: 16px;
        }

        .eq-thumb {
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          border: 1px solid #e4e4e4;
          border-radius: 8px;
          object-fit: cover;
          background: #fafafa;
        }

        .eq-gallery {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(104px, 1fr));
          gap: 10px;
          padding: 10px;
          border: 1px dashed #d4d4d4;
          border-radius: 12px;
          background: #fafafa;
          transition: border-color 0.15s ease, background 0.15s ease;
        }

        .eq-gallery.drag {
          border-color: #6f42c1;
          background: #f3efff;
        }

        .eq-gallery-state {
          grid-column: 1 / -1;
          padding: 24px 0;
          text-align: center;
          color: #737373;
          font-size: 14px;
        }

        .eq-gallery-item {
          position: relative;
          aspect-ratio: 1;
          border: 1px solid #e4e4e4;
          border-radius: 10px;
          overflow: hidden;
          background: #ffffff;
        }

        .eq-gallery-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .eq-gallery-cover,
        .eq-gallery-pending {
          position: absolute;
          left: 6px;
          padding: 1px 8px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
        }

        .eq-gallery-cover {
          top: 6px;
          background: #6f42c1;
          color: #ffffff;
        }

        .eq-gallery-pending {
          bottom: 6px;
          background: rgba(23, 23, 23, 0.7);
          color: #ffffff;
          font-weight: 500;
        }

        .eq-gallery-remove {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 24px;
          height: 24px;
          padding: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 0;
          border-radius: 999px;
          background: rgba(23, 23, 23, 0.65);
          color: #ffffff;
          font-size: 11px;
        }

        .eq-gallery-remove:hover:not(:disabled) {
          background: #e11d48;
        }

        .eq-gallery-add {
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          border: 1px dashed #c4b5fd;
          border-radius: 10px;
          background: #ffffff;
          color: #6f42c1;
          font-size: 20px;
        }

        .eq-gallery-add small {
          font-size: 12px;
          font-weight: 500;
        }

        .eq-gallery-add:hover:not(:disabled) {
          background: #f3efff;
        }

        .eq-cat-state {
          padding: 24px 12px;
          text-align: center;
        }

        .eq-cat-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-bottom: 1px solid #f0f0f0;
        }

        .eq-cat-row:last-child {
          border-bottom: 0;
        }

        .eq-cat-text {
          min-width: 0;
        }

        .eq-cat-thumb {
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e4e4e4;
          border-radius: 8px;
          overflow: hidden;
          background: #f3efff;
          color: #6f42c1;
          font-size: 18px;
        }

        .eq-cat-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .eq-action {
          width: 32px;
          height: 32px;
          padding: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e4e4e4;
          border-radius: 8px;
          background: #ffffff;
          color: #404040;
        }

        .eq-action:hover {
          background: #f3efff;
          border-color: #d9ccff;
          color: #6f42c1;
        }

        .eq-action.danger {
          color: #e11d48;
        }

        .eq-action.danger:hover {
          background: #fff1f2;
          border-color: #fecdd3;
          color: #e11d48;
        }

        .equipment-modal,
        .equipment-delete-dialog .equipment-modal {
          border: 1px solid #e4e4e4;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        .delete-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          background: #fff1f2;
          color: #e11d48;
        }

        .alert-danger {
          border: 1px solid #fecdd3;
          border-radius: 8px;
          background: #fff1f2;
          color: #9f1239;
          font-size: 14px;
        }
      `}</style>

      {/* ให้ SweetAlert อยู่เหนือหน้าต่าง modal ของหน้านี้ */}
      <style jsx global>{`
        .swal2-container {
          z-index: 3000 !important;
        }
      `}</style>


    </main>
  );
}
