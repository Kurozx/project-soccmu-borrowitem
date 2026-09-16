"use client";

import { useState } from "react";
import Link from "next/link";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

type BorrowingItem = {
  id: number;
  borrowId: string;
  equipmentCode: string;
  name: string;
  category: string;
  location: string;
  borrowDate: string;
  returnDate: string;
  purpose: string;
  icon: string;
  daysLeft: number;
};

const borrowingData: BorrowingItem[] = [
  {
    id: 1,
    borrowId: "BR-2026-002",
    equipmentCode: "SOC-CAM-001",
    name: "Digital Camera",
    category: "อุปกรณ์ถ่ายภาพ",
    location: "ห้องโสตทัศนศึกษา",
    borrowDate: "3 ก.ย. 2026",
    returnDate: "10 ก.ย. 2026",
    purpose: "ถ่ายภาพกิจกรรมของคณะ",
    icon: "bi-camera",
    daysLeft: 3,
  },
  {
    id: 2,
    borrowId: "BR-2026-008",
    equipmentCode: "SOC-PRO-002",
    name: "Projector",
    category: "อุปกรณ์นำเสนอ",
    location: "ห้องประชุมคณะ",
    borrowDate: "6 ก.ย. 2026",
    returnDate: "8 ก.ย. 2026",
    purpose: "นำเสนอผลงานวิจัย",
    icon: "bi-projector",
    daysLeft: 1,
  },
];

export default function BorrowingPage() {
  const [selectedItem, setSelectedItem] =
    useState<BorrowingItem | null>(null);

  const [showReturnModal, setShowReturnModal] =
    useState(false);

  const [returnItem, setReturnItem] =
    useState<BorrowingItem | null>(null);

  const [items, setItems] =
    useState<BorrowingItem[]>(borrowingData);

  const openReturnModal = (item: BorrowingItem) => {
    setReturnItem(item);
    setShowReturnModal(true);
  };

  const confirmReturn = () => {
    if (!returnItem) return;

    setItems((current) =>
      current.filter(
        (item) => item.id !== returnItem.id
      )
    );

    setShowReturnModal(false);
    setSelectedItem(null);
    setReturnItem(null);
  };

  return (
    <main className="bg-light min-vh-100">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top">

        <div className="container py-2">

          <Link
            href="/"
            className="navbar-brand d-flex align-items-center gap-3"
          >

            <div
              className="d-flex align-items-center justify-content-center rounded-3"
              style={{
                width: "48px",
                height: "48px",
                background: "#6f42c1",
                color: "white",
              }}
            >
              <i className="bi bi-box-seam fs-4"></i>
            </div>

            <div>

              <div className="fw-bold text-dark">
                ระบบยืม–คืนครุภัณฑ์
              </div>

              <small className="text-secondary">
                คณะสังคมศาสตร์ มหาวิทยาลัยเชียงใหม่
              </small>

            </div>

          </Link>


          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarMenu"
          >
            <span className="navbar-toggler-icon"></span>
          </button>


          <div
            className="collapse navbar-collapse"
            id="navbarMenu"
          >

            <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">

              <li className="nav-item">

                <Link
                  href="/"
                  className="nav-link"
                >
                  <i className="bi bi-house me-1"></i>
                  หน้าหลัก
                </Link>

              </li>


              <li className="nav-item">

                <Link
                  href="/equipment"
                  className="nav-link"
                >
                  <i className="bi bi-box me-1"></i>
                  ครุภัณฑ์
                </Link>

              </li>


              <li className="nav-item">

                <Link
                  href="/search"
                  className="nav-link"
                >
                  <i className="">CMU</i>
                  ค้นหา
                </Link>

              </li>


              <li className="nav-item">

                <Link
                  href="/history"
                  className="nav-link"
                >
                  <i className="bi bi-clock-history me-1"></i>
                  ประวัติการยืม
                </Link>

              </li>


              <li className="nav-item">

                <Link
                  href="/borrowing"
                  className="nav-link active fw-semibold"
                >
                  <i className="bi bi-box-arrow-up-right me-1"></i>
                  กำลังยืม
                </Link>

              </li>


              <li className="nav-item ms-lg-2">

                <Link
                  href="/profile"
                  className="btn rounded-pill px-4 text-white"
                  style={{
                    background: "#6f42c1",
                  }}
                >

                  <i className="bi bi-person-circle me-2"></i>

                  โปรไฟล์

                </Link>

              </li>

            </ul>

          </div>

        </div>

      </nav>


      {/* =====================================================
          HEADER
      ===================================================== */}

      <section
        className="py-5"
        style={{
          background:
            "linear-gradient(135deg, #f5f0ff 0%, #ffffff 60%, #eee8ff 100%)",
        }}
      >

        <div className="container">

          <div className="row align-items-center">

            <div className="col-lg-8">

              <span className="badge rounded-pill bg-white border text-primary px-3 py-2 mb-3">

                <i className="bi bi-box-arrow-up-right me-2"></i>

                CURRENT BORROWING

              </span>


              <h1 className="fw-bold display-6 mb-3">

                รายการที่กำลังยืม

              </h1>


              <p className="text-secondary lead mb-0">

                ตรวจสอบครุภัณฑ์ที่คุณกำลังยืม
                และกำหนดวันคืนของแต่ละรายการ

              </p>

            </div>


            <div className="col-lg-4 mt-4 mt-lg-0">

              <div className="bg-white rounded-4 shadow-sm p-4">

                <div className="d-flex align-items-center gap-3">

                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center"
                    style={{
                      width: "55px",
                      height: "55px",
                      background: "#fff3cd",
                      color: "#997404",
                    }}
                  >

                    <i className="bi bi-box-seam fs-4"></i>

                  </div>


                  <div>

                    <small className="text-secondary">
                      กำลังยืมทั้งหมด
                    </small>

                    <div className="fs-2 fw-bold">

                      {items.length}

                      <span className="fs-6 fw-normal text-secondary ms-2">
                        รายการ
                      </span>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          ALERT
      ===================================================== */}

      {items.length > 0 && (

        <section className="pt-4">

          <div className="container">

            <div className="alert alert-warning border-0 rounded-4 d-flex gap-3 align-items-center">

              <i className="bi bi-exclamation-circle-fill fs-4"></i>

              <div>

                <strong>
                  อย่าลืมคืนครุภัณฑ์ตามกำหนด
                </strong>

                <div className="small mt-1">

                  กรุณานำครุภัณฑ์มาคืนตามวันที่กำหนด
                  เพื่อไม่ให้เกิดรายการค้างส่งคืน

                </div>

              </div>

            </div>

          </div>

        </section>

      )}


      {/* =====================================================
          BORROWING LIST
      ===================================================== */}

      <section className="py-4 pb-5">

        <div className="container">

          {items.length > 0 ? (

            <>

              <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                  <h4 className="fw-bold mb-1">

                    ครุภัณฑ์ของฉัน

                  </h4>

                  <span className="text-secondary">

                    รายการที่ยังไม่ได้ดำเนินการคืน

                  </span>

                </div>

              </div>


              <div className="row g-4">

                {items.map((item) => (

                  <div
                    className="col-lg-6"
                    key={item.id}
                  >

                    <BorrowingCard
                      item={item}
                      onDetail={() =>
                        setSelectedItem(item)
                      }
                      onReturn={() =>
                        openReturnModal(item)
                      }
                    />

                  </div>

                ))}

              </div>

            </>

          ) : (

            <EmptyState />

          )}

        </div>

      </section>


      {/* =====================================================
          DETAIL MODAL
      ===================================================== */}

      {selectedItem && (

        <div
          className="modal fade show d-block"
          style={{
            backgroundColor:
              "rgba(0,0,0,0.6)",
          }}
          onClick={() =>
            setSelectedItem(null)
          }
        >

          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-content border-0 rounded-4 overflow-hidden">

              {/* MODAL IMAGE */}

              <div
                className="position-relative d-flex align-items-center justify-content-center"
                style={{
                  height: "210px",
                  background:
                    "linear-gradient(135deg,#f4f0fa,#eee8ff)",
                  color: "#6f42c1",
                }}
              >

                <i
                  className={selectedItem.icon}
                  style={{
                    fontSize: "85px",
                  }}
                ></i>


                <button
                  className="btn-close position-absolute top-0 end-0 m-3 bg-white rounded-circle p-2"
                  onClick={() =>
                    setSelectedItem(null)
                  }
                ></button>


                <span className="badge rounded-pill bg-warning text-dark position-absolute bottom-0 start-50 translate-middle-x mb-3 px-3 py-2">

                  <i className="bi bi-clock me-1"></i>

                  กำลังยืม

                </span>

              </div>


              {/* BODY */}

              <div className="modal-body p-4 p-lg-5">

                <div className="text-center mb-4">

                  <small
                    className="fw-bold"
                    style={{
                      color: "#6f42c1",
                    }}
                  >

                    {selectedItem.borrowId}

                  </small>


                  <h3 className="fw-bold mt-2 mb-1">

                    {selectedItem.name}

                  </h3>


                  <p className="text-secondary">

                    {selectedItem.equipmentCode}

                  </p>

                </div>


                <div className="row g-3">

                  <InfoBox
                    icon="bi-tag"
                    title="ประเภท"
                    value={selectedItem.category}
                  />

                  <InfoBox
                    icon="bi-geo-alt"
                    title="สถานที่จัดเก็บ"
                    value={selectedItem.location}
                  />

                  <InfoBox
                    icon="bi-calendar-check"
                    title="วันที่ยืม"
                    value={selectedItem.borrowDate}
                  />

                  <InfoBox
                    icon="bi-calendar-event"
                    title="กำหนดคืน"
                    value={selectedItem.returnDate}
                  />

                </div>


                <div className="bg-light rounded-4 p-4 mt-4">

                  <div className="d-flex gap-3">

                    <div
                      className="rounded-3 d-flex align-items-center justify-content-center"
                      style={{
                        width: "45px",
                        height: "45px",
                        background: "#eee8ff",
                        color: "#6f42c1",
                      }}
                    >

                      <i className="bi bi-chat-left-text"></i>

                    </div>


                    <div>

                      <small className="text-secondary">

                        วัตถุประสงค์ในการยืม

                      </small>

                      <div className="fw-semibold mt-1">

                        {selectedItem.purpose}

                      </div>

                    </div>

                  </div>

                </div>


                {/* RETURN WARNING */}

                <div className="alert alert-warning border-0 rounded-4 mt-3 mb-0">

                  <div className="d-flex gap-3">

                    <i className="bi bi-calendar2-check fs-4"></i>

                    <div>

                      <strong>
                        เหลืออีก {selectedItem.daysLeft} วัน
                      </strong>

                      <div className="small mt-1">

                        กรุณาคืนครุภัณฑ์ภายในวันที่{" "}
                        <strong>
                          {selectedItem.returnDate}
                        </strong>

                      </div>

                    </div>

                  </div>

                </div>

              </div>


              {/* FOOTER */}

              <div className="modal-footer border-0 px-4 pb-4">

                <button
                  className="btn btn-light rounded-pill px-4"
                  onClick={() =>
                    setSelectedItem(null)
                  }
                >

                  ปิด

                </button>


                <button
                  className="btn btn-success rounded-pill px-4"
                  onClick={() =>
                    openReturnModal(selectedItem)
                  }
                >

                  <i className="bi bi-box-arrow-in-left me-2"></i>

                  คืนครุภัณฑ์

                </button>

              </div>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          RETURN CONFIRM MODAL
      ===================================================== */}

      {showReturnModal && returnItem && (

        <div
          className="modal fade show d-block"
          style={{
            backgroundColor:
              "rgba(0,0,0,0.7)",
            zIndex: 1060,
          }}
        >

          <div className="modal-dialog modal-dialog-centered">

            <div className="modal-content border-0 rounded-4">

              <div className="modal-body text-center p-5">

                <div
                  className="mx-auto mb-4 rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "85px",
                    height: "85px",
                    background: "#d1e7dd",
                    color: "#198754",
                  }}
                >

                  <i className="bi bi-box-arrow-in-left fs-1"></i>

                </div>


                <h4 className="fw-bold">

                  ยืนยันการคืนครุภัณฑ์?

                </h4>


                <p className="text-secondary mb-1">

                  คุณกำลังดำเนินการคืน

                </p>


                <div className="fw-bold">

                  {returnItem.name}

                </div>


                <small className="text-secondary">

                  {returnItem.equipmentCode}

                </small>


                <div className="alert alert-info border-0 rounded-4 mt-4 text-start">

                  <i className="bi bi-info-circle me-2"></i>

                  หลังจากยืนยัน กรุณานำครุภัณฑ์ไปส่งคืนที่
                  <strong> ห้องโสตทัศนศึกษา / จุดรับคืนครุภัณฑ์</strong>

                </div>


                <div className="d-flex gap-2 mt-4">

                  <button
                    className="btn btn-light rounded-pill flex-grow-1"
                    onClick={() => {
                      setShowReturnModal(false);
                      setReturnItem(null);
                    }}
                  >

                    ยกเลิก

                  </button>


                  <button
                    className="btn btn-success rounded-pill flex-grow-1"
                    onClick={confirmReturn}
                  >

                    <i className="bi bi-check-lg me-2"></i>

                    ยืนยันคืน

                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer
        className="py-4 text-white"
        style={{
          background: "#17131f",
        }}
      >

        <div className="container">

          <div className="d-flex flex-column flex-md-row justify-content-between gap-3">

            <div>

              <div className="fw-bold">
                ระบบยืม–คืนครุภัณฑ์
              </div>

              <small className="text-white-50">
                คณะสังคมศาสตร์ มหาวิทยาลัยเชียงใหม่
              </small>

            </div>


            <div className="text-white-50 small">

              © 2026 Faculty of Social Sciences

            </div>

          </div>

        </div>

      </footer>

    </main>
  );
}


/* =====================================================
   BORROWING CARD
===================================================== */

function BorrowingCard({
  item,
  onDetail,
  onReturn,
}: {
  item: BorrowingItem;
  onDetail: () => void;
  onReturn: () => void;
}) {

  return (

    <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">

      {/* TOP */}

      <div
        className="d-flex align-items-center justify-content-center position-relative"
        style={{
          height: "180px",
          background:
            "linear-gradient(135deg,#f4f0fa,#eee8ff)",
          color: "#6f42c1",
        }}
      >

        <i
          className={item.icon}
          style={{
            fontSize: "70px",
          }}
        ></i>


        <span className="badge rounded-pill bg-warning text-dark position-absolute top-0 end-0 m-3 px-3 py-2">

          <i className="bi bi-clock me-1"></i>

          กำลังยืม

        </span>

      </div>


      {/* BODY */}

      <div className="card-body p-4">

        <div className="d-flex justify-content-between gap-3">

          <div>

            <small
              className="fw-bold"
              style={{
                color: "#6f42c1",
              }}
            >

              {item.borrowId}

            </small>


            <h4 className="fw-bold mt-2 mb-1">

              {item.name}

            </h4>


            <small className="text-secondary">

              {item.equipmentCode}

            </small>

          </div>

        </div>


        <hr className="my-4" />


        <div className="row g-3">

          <div className="col-6">

            <small className="text-secondary d-block mb-1">

              <i className="bi bi-calendar-check me-1"></i>

              วันที่ยืม

            </small>

            <span className="fw-semibold">

              {item.borrowDate}

            </span>

          </div>


          <div className="col-6">

            <small className="text-secondary d-block mb-1">

              <i className="bi bi-calendar-event me-1"></i>

              กำหนดคืน

            </small>

            <span className="fw-semibold">

              {item.returnDate}

            </span>

          </div>


          <div className="col-12">

            <small className="text-secondary d-block mb-1">

              <i className="bi bi-clock me-1"></i>

              ระยะเวลาที่เหลือ

            </small>

            <div className="progress" style={{ height: "8px" }}>

              <div
                className={`progress-bar ${
                  item.daysLeft <= 1
                    ? "bg-danger"
                    : "bg-warning"
                }`}
                style={{
                  width:
                    item.daysLeft <= 1
                      ? "85%"
                      : "55%",
                }}
              ></div>

            </div>


            <small
              className={
                item.daysLeft <= 1
                  ? "text-danger fw-semibold"
                  : "text-warning fw-semibold"
              }
            >

              เหลืออีก {item.daysLeft} วัน

            </small>

          </div>

        </div>

      </div>


      {/* FOOTER */}

      <div className="card-footer bg-white border-0 p-4 pt-0">

        <div className="d-flex gap-2">

          <button
            className="btn btn-outline-dark rounded-pill flex-grow-1"
            onClick={onDetail}
          >

            <i className="bi bi-eye me-2"></i>

            รายละเอียด

          </button>


          <button
            className="btn btn-success rounded-pill flex-grow-1"
            onClick={onReturn}
          >

            <i className="bi bi-box-arrow-in-left me-2"></i>

            คืน

          </button>

        </div>

      </div>

    </div>
  );
}


/* =====================================================
   INFO BOX
===================================================== */

function InfoBox({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: string;
}) {

  return (

    <div className="col-md-6">

      <div className="bg-light rounded-4 p-3 h-100">

        <div className="d-flex gap-3">

          <div
            className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
            style={{
              width: "45px",
              height: "45px",
              background: "#eee8ff",
              color: "#6f42c1",
            }}
          >

            <i className={icon}></i>

          </div>


          <div>

            <small className="text-secondary">

              {title}

            </small>


            <div className="fw-semibold mt-1">

              {value}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}


/* =====================================================
   EMPTY STATE
===================================================== */

function EmptyState() {

  return (

    <div className="card border-0 shadow-sm rounded-4">

      <div className="card-body text-center py-5">

        <div
          className="mx-auto mb-4 rounded-circle d-flex align-items-center justify-content-center"
          style={{
            width: "110px",
            height: "110px",
            background: "#eee8ff",
            color: "#6f42c1",
          }}
        >

          <i className="bi bi-box-seam fs-1"></i>

        </div>


        <h3 className="fw-bold">

          ไม่มีครุภัณฑ์ที่กำลังยืม

        </h3>


        <p className="text-secondary mb-4">

          ตอนนี้คุณไม่มีรายการครุภัณฑ์ที่ต้องคืน

        </p>


        <Link
          href="/search"
          className="btn text-white rounded-pill px-4"
          style={{
            background: "#6f42c1",
          }}
        >

          <i className="bi bi-search me-2"></i>

          ค้นหาครุภัณฑ์เพื่อยืม

        </Link>

      </div>

    </div>
  );
}