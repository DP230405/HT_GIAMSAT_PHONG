// ================= FIREBASE + EMAILJS =================

const cauhinhfirebase = {
    apiKey: "AIzaSyB_zGJGfU_RnYSE-wO0ogCxbhTD7WKkNHM",
    authDomain: "iotlab-nhom16-ht-giamsat-phong.firebaseapp.com",
    databaseURL: "https://iotlab-nhom16-ht-giamsat-phong-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "iotlab-nhom16-ht-giamsat-phong",
    storageBucket: "iotlab-nhom16-ht-giamsat-phong.firebasestorage.app",
    messagingSenderId: "301850881875",
    appId: "1:301850881875:web:297c67ede2bd518061bba6",
    measurementId: "G-PZN4SE95ZW"
};

firebase.initializeApp(cauhinhfirebase);

const xacthuc = firebase.auth();
const csdl = firebase.database();

const serviceid = "gmail_nhom16";
const templateid = "template_4v3z8mm";
const publickey = "mFptn-zwVNirsJHqB";
const gmailquantri = "dephuonga2@gmail.com";

emailjs.init({
    publicKey: publickey
});

// ================= BIẾN TOÀN CỤC =================

let nguoidunghientai = null;
let thongtinnguoidung = null;
let dulieuphong = null;
let tatcalichsu = [];
let tatcanguoidung = {};
let chedothongke = "realtime";
let chedolichsu = "all";

let bieudonhietdo = null;
let bieudodoam = null;
let bieudoanhsang = null;
let bieudothongke = null;

const maunhietdo = "#ef4444";
const maundoam = "#06b6d4";
const mauanhsang = "#eab308";

const maunennhietdo = "rgba(239, 68, 68, 0.12)";
const maunendoam = "rgba(6, 182, 212, 0.12)";
const maunenanhsang = "rgba(234, 179, 8, 0.12)";

// ================= KHỞI ĐỘNG =================

document.addEventListener("DOMContentLoaded", function () {
    khoitaoformdangnhap();
    khoitaogiaodien();
    khoitaobieudo();
    khoitaongaythang();
    langnghexacthuc();
});

// ================= ĐĂNG NHẬP / ĐĂNG KÝ =================

function khoitaoformdangnhap() {
    const nutdangnhap = document.getElementById("nutdangnhap");
    const nutdangky = document.getElementById("nutdangky");
    const formdangnhap = document.getElementById("formdangnhap");
    const formdangky = document.getElementById("formdangky");

    if (nutdangnhap) nutdangnhap.addEventListener("click", hienformdangnhap);
    if (nutdangky) nutdangky.addEventListener("click", hienformdangky);
    if (formdangnhap) formdangnhap.addEventListener("submit", dangnhap);
    if (formdangky) formdangky.addEventListener("submit", dangky);
}

function hienformdangnhap() {
    document.getElementById("formdangnhap").classList.remove("an");
    document.getElementById("formdangky").classList.add("an");
    document.getElementById("nutdangnhap").classList.add("dang-chon");
    document.getElementById("nutdangky").classList.remove("dang-chon");
    hienthongbaoform("");
}

function hienformdangky() {
    document.getElementById("formdangky").classList.remove("an");
    document.getElementById("formdangnhap").classList.add("an");
    document.getElementById("nutdangky").classList.add("dang-chon");
    document.getElementById("nutdangnhap").classList.remove("dang-chon");
    hienthongbaoform("");
}

function hienthongbaoform(noidung, loai = "loi") {
    const khung = document.getElementById("thongbaodangnhap");
    if (!khung) return;

    khung.textContent = noidung;
    khung.className = "thong-bao-form " + loai;
}

async function dangnhap(sukien) {
    sukien.preventDefault();

    const gmail = document.getElementById("gmaildangnhap").value.trim();
    const matkhau = document.getElementById("matkhaudangnhap").value;

    try {
        const ketqua = await xacthuc.signInWithEmailAndPassword(gmail, matkhau);

        nguoidunghientai = ketqua.user;

        await taohosochoadminneucan(ketqua.user);
        await docthongtinnguoidung(ketqua.user.uid);

        hienthongbaoform("Đăng nhập thành công.", "thanhcong");
        hiengiaodienchinh();
        batdaulaydulieu();

    } catch (loi) {
        console.log("Lỗi đăng nhập:", loi);
        hienthongbaoform("Đăng nhập thất bại: " + laythongbaoloi(loi));
    }
}

async function dangky(sukien) {
    sukien.preventDefault();

    const hoten = document.getElementById("hoten").value.trim();
    const gmail = document.getElementById("gmaildangky").value.trim();
    const sodienthoai = document.getElementById("sodienthoai").value.trim();
    const matkhau = document.getElementById("matkhaudangky").value;
    const xacnhanmatkhau = document.getElementById("xacnhanmatkhau").value;
    const lydodangky = document.getElementById("lydodangky").value.trim();

    if (matkhau !== xacnhanmatkhau) {
        hienthongbaoform("Mật khẩu xác nhận không khớp.");
        return;
    }

    if (matkhau.length < 6) {
        hienthongbaoform("Mật khẩu phải có ít nhất 6 ký tự.");
        return;
    }

    try {
        const ketqua = await xacthuc.createUserWithEmailAndPassword(gmail, matkhau);
        const uid = ketqua.user.uid;
        const vaitro = gmail.toLowerCase() === gmailquantri.toLowerCase() ? "admin" : "user";

        await csdl.ref("roomguard/users/" + uid).set({
            uid: uid,
            hoten: hoten,
            gmail: gmail,
            sodienthoai: sodienthoai,
            lydodangky: lydodangky,
            vaitro: vaitro,
            yeucauadmin: false,
            trangthaiyeucau: "none",
            maotp: "",
            thoigianhethanotp: 0,
            ngaydangky: new Date().toLocaleString("vi-VN")
        });

        hienthongbaoform("Đăng ký thành công. Bạn có thể đăng nhập.", "thanhcong");
        hienformdangnhap();

    } catch (loi) {
        console.log("Lỗi đăng ký:", loi);
        hienthongbaoform("Đăng ký thất bại: " + laythongbaoloi(loi));
    }
}

function laythongbaoloi(loi) {
    if (!loi || !loi.code) return "Không rõ lỗi.";

    if (loi.code === "auth/user-not-found") return "Không tìm thấy tài khoản.";
    if (loi.code === "auth/wrong-password") return "Sai mật khẩu.";
    if (loi.code === "auth/invalid-credential") return "Sai Gmail hoặc mật khẩu.";
    if (loi.code === "auth/email-already-in-use") return "Gmail này đã được đăng ký.";
    if (loi.code === "auth/invalid-email") return "Gmail không hợp lệ.";
    if (loi.code === "auth/weak-password") return "Mật khẩu quá yếu.";
    if (loi.code === "auth/invalid-api-key") return "Sai Firebase API key.";

    return loi.code + " - " + loi.message;
}

function langnghexacthuc() {
    xacthuc.onAuthStateChanged(async function (user) {
        if (!user) {
            nguoidunghientai = null;
            thongtinnguoidung = null;
            hienmanhinhdangnhap();
            return;
        }

        try {
            nguoidunghientai = user;

            await taohosochoadminneucan(user);
            await docthongtinnguoidung(user.uid);

            hiengiaodienchinh();
            batdaulaydulieu();

        } catch (loi) {
            console.log("Lỗi khi mở giao diện chính:", loi);
            alert("Đăng nhập được nhưng lỗi khi tải dữ liệu: " + loi.message);
        }
    });
}

async function taohosochoadminneucan(user) {
    if (!user || !user.email) return;
    if (user.email.toLowerCase() !== gmailquantri.toLowerCase()) return;

    const snap = await csdl.ref("roomguard/users/" + user.uid).once("value");

    if (snap.exists()) {
        await csdl.ref("roomguard/users/" + user.uid).update({
            vaitro: "admin",
            gmail: user.email
        });
        return;
    }

    await csdl.ref("roomguard/users/" + user.uid).set({
        uid: user.uid,
        hoten: "Admin Nhóm 16",
        gmail: user.email,
        sodienthoai: "0967019477",
        lydodangky: "Tài khoản quản trị chính",
        vaitro: "admin",
        yeucauadmin: false,
        trangthaiyeucau: "none",
        maotp: "",
        thoigianhethanotp: 0,
        ngaydangky: new Date().toLocaleString("vi-VN")
    });
}

async function docthongtinnguoidung(uid) {
    const snap = await csdl.ref("roomguard/users/" + uid).once("value");
    thongtinnguoidung = snap.val();

    if (!thongtinnguoidung) {
        thongtinnguoidung = {
            uid: uid,
            hoten: nguoidunghientai.email,
            gmail: nguoidunghientai.email,
            sodienthoai: "",
            lydodangky: "",
            vaitro: "user",
            yeucauadmin: false,
            trangthaiyeucau: "none",
            maotp: "",
            thoigianhethanotp: 0,
            ngaydangky: new Date().toLocaleString("vi-VN")
        };

        await csdl.ref("roomguard/users/" + uid).set(thongtinnguoidung);
    }

    if (thongtinnguoidung.gmail && thongtinnguoidung.gmail.toLowerCase() === gmailquantri.toLowerCase()) {
        thongtinnguoidung.vaitro = "admin";
        await csdl.ref("roomguard/users/" + uid).update({
            vaitro: "admin"
        });
    }

    capnhatthongtintaikhoan();
}

// ================= ẨN / HIỆN MÀN HÌNH =================

function hienmanhinhdangnhap() {
    const manhinhdangnhap = document.getElementById("manhinhdangnhap");
    const giaodienchinh = document.getElementById("giaodienchinh");

    if (manhinhdangnhap) manhinhdangnhap.classList.add("dang-hien");
    if (giaodienchinh) giaodienchinh.classList.remove("dang-hien");
}

function hiengiaodienchinh() {
    const manhinhdangnhap = document.getElementById("manhinhdangnhap");
    const giaodienchinh = document.getElementById("giaodienchinh");

    if (manhinhdangnhap) manhinhdangnhap.classList.remove("dang-hien");
    if (giaodienchinh) giaodienchinh.classList.add("dang-hien");
}

function capnhatthongtintaikhoan() {
    if (!thongtinnguoidung) return;

    const ten = thongtinnguoidung.hoten || "Người dùng";
    const gmail = thongtinnguoidung.gmail || nguoidunghientai.email;
    const vaitro = thongtinnguoidung.vaitro || "user";

    const tenhienthi = document.getElementById("tenhienthi");
    const tennguoidung = document.getElementById("tennguoidung");
    const gmailnguoidung = document.getElementById("gmailnguoidung");
    const vaitrohienthi = document.getElementById("vaitrohienthi");

    if (tenhienthi) tenhienthi.textContent = ten;
    if (tennguoidung) tennguoidung.value = ten;
    if (gmailnguoidung) gmailnguoidung.value = gmail;
    if (vaitrohienthi) vaitrohienthi.value = vaitro === "admin" ? "Admin" : "User";

    hienthiphannangcapadmin();
    khoaquyentheovaitro();
}

function khoaquyentheovaitro() {
    const laadmin = thongtinnguoidung && thongtinnguoidung.vaitro === "admin";

    const danhsachid = [
        "nguongnhietdo",
        "nguongdoam",
        "nguonganhsanghoctap",
        "nguonganhsangnghingoi",
        "chedohethong",
        "nutluucaidat"
    ];

    danhsachid.forEach(function (id) {
        const phantu = document.getElementById(id);
        if (phantu) phantu.disabled = !laadmin;
    });
}

// ================= GIAO DIỆN CHUNG =================

function khoitaogiaodien() {
    const danhsachmenu = document.querySelectorAll(".nav-links li");
    const danhsachtrang = document.querySelectorAll(".page");
    const tieudetrang = document.getElementById("tieudetrang");
    const sidebar = document.getElementById("sidebar");
    const nutmosidebar = document.getElementById("mosidebar");
    const nutdongsidebar = document.getElementById("dongsidebar");
    const nutdangxuat = document.getElementById("nutdangxuat");
    const nutdoigiaodien = document.getElementById("nutdoigiaoDien");
    const switchgiaodien = document.getElementById("nutchedoitoi");

    danhsachmenu.forEach(function (menu) {
        menu.addEventListener("click", function () {
            danhsachmenu.forEach(function (item) {
                item.classList.remove("active");
            });

            danhsachtrang.forEach(function (trang) {
                trang.classList.remove("active");
            });

            menu.classList.add("active");

            const tentrang = menu.getAttribute("data-target");
            const tranghientai = document.getElementById(tentrang);

            if (tranghientai) tranghientai.classList.add("active");
            if (tieudetrang) tieudetrang.textContent = menu.querySelector("span").textContent;

            if (window.innerWidth <= 768 && sidebar) {
                sidebar.classList.remove("show");
            }

            if (tentrang === "tranglichsu") {
                hienthilichsu(tatcalichsu);
            }

            if (tentrang === "trangcaidat") {
                hienthiphannangcapadmin();
            }
        });
    });

    if (nutmosidebar) {
        nutmosidebar.addEventListener("click", function () {
            sidebar.classList.add("show");
        });
    }

    if (nutdongsidebar) {
        nutdongsidebar.addEventListener("click", function () {
            sidebar.classList.remove("show");
        });
    }

    if (nutdangxuat) {
        nutdangxuat.addEventListener("click", dangxuat);
    }

    setInterval(capnhatdongho, 1000);
    capnhatdongho();

    const giaodiendaluulai = localStorage.getItem("giaodienroomguard") || "dark";
    document.documentElement.setAttribute("data-theme", giaodiendaluulai);

    if (switchgiaodien) {
        switchgiaodien.checked = giaodiendaluulai === "dark";
    }

    capnhaticonchudegiaodien(giaodiendaluulai);

    if (nutdoigiaodien) {
        nutdoigiaodien.addEventListener("click", doigiaodien);
    }

    if (switchgiaodien) {
        switchgiaodien.addEventListener("change", doigiaodien);
    }

    const nutluucaidat = document.getElementById("nutluucaidat");
    if (nutluucaidat) {
        nutluucaidat.addEventListener("click", luucaidat);
    }

    khoitaochatbot();
}

function capnhatdongho() {
    const now = new Date();
    const dongho = document.getElementById("dongho");

    if (dongho) {
        dongho.textContent = now.toLocaleTimeString("vi-VN", {
            hour12: false
        });
    }
}

function doigiaodien() {
    const giaodienhientai = document.documentElement.getAttribute("data-theme");
    const giaodienmoi = giaodienhientai === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", giaodienmoi);
    localStorage.setItem("giaodienroomguard", giaodienmoi);

    const switchgiaodien = document.getElementById("nutchedoitoi");
    if (switchgiaodien) switchgiaodien.checked = giaodienmoi === "dark";

    capnhaticonchudegiaodien(giaodienmoi);
}

function capnhaticonchudegiaodien(giaodien) {
    const nutdoigiaodien = document.getElementById("nutdoigiaoDien");
    if (!nutdoigiaodien) return;

    if (giaodien === "dark") {
        nutdoigiaodien.innerHTML = "<i class='bx bx-sun'></i>";
    } else {
        nutdoigiaodien.innerHTML = "<i class='bx bx-moon'></i>";
    }
}

function dangxuat() {
    xacthuc.signOut();
}

// ================= FIREBASE DATA =================

function batdaulaydulieu() {
    langngheketnoi();
    docdulieuphong();
    doccaidat();
    doclichsu();
    docdanhsachnguoidung();
}

function langngheketnoi() {
    const khungketnoi = document.getElementById("trangthaiketnoi");
    if (!khungketnoi) return;

    csdl.ref(".info/connected").on("value", function (snap) {
        if (snap.val() === true) {
            khungketnoi.innerHTML = `<span class="dot pulse"></span> <span class="text">Online</span>`;
        } else {
            khungketnoi.innerHTML = `<span class="dot dot-do"></span> <span class="text text-do">Offline</span>`;
        }
    });
}

function docdulieuphong() {
    csdl.ref("roomguard/data").on("value", function (snapshot) {
        const data = snapshot.val();

        if (!data) {
            taodulieumauneucan();
            return;
        }

        dulieuphong = data;
        capnhatgiaodiendashboard(data);
    });
}

function taodulieumauneucan() {
    const thoigian = Math.floor(Date.now() / 1000);

    csdl.ref("roomguard/data").set({
        temperature: 28,
        humidity: 60,
        light: 450,
        mode: "hoc_tap",
        esp: "online",
        updatedAt: thoigian
    });

    csdl.ref("roomguard/history").push({
        temperature: 28,
        humidity: 60,
        light: 450,
        mode: "hoc_tap",
        updatedAt: thoigian
    });
}

function doccaidat() {
    csdl.ref("roomguard/settings").on("value", function (snapshot) {
        const data = snapshot.val();

        if (!data) {
            csdl.ref("roomguard/settings").set({
                nguongnhietdo: 30,
                nguongdoam: 65,
                nguonganhsanghoctap: 300,
                nguonganhsangnghingoi: 250,
                chedohethong: "hoc_tap"
            });
            return;
        }

        const nguongnhietdo = document.getElementById("nguongnhietdo");
        const nguongdoam = document.getElementById("nguongdoam");
        const nguonganhsanghoctap = document.getElementById("nguonganhsanghoctap");
        const nguonganhsangnghingoi = document.getElementById("nguonganhsangnghingoi");
        const chedohethong = document.getElementById("chedohethong");

        if (nguongnhietdo) nguongnhietdo.value = data.nguongnhietdo ?? 30;
        if (nguongdoam) nguongdoam.value = data.nguongdoam ?? 65;
        if (nguonganhsanghoctap) nguonganhsanghoctap.value = data.nguonganhsanghoctap ?? 300;
        if (nguonganhsangnghingoi) nguonganhsangnghingoi.value = data.nguonganhsangnghingoi ?? 250;
        if (chedohethong) chedohethong.value = data.chedohethong ?? "hoc_tap";
    });
}

async function luucaidat() {
    if (!thongtinnguoidung || thongtinnguoidung.vaitro !== "admin") {
        alert("Chỉ admin mới được lưu cài đặt.");
        return;
    }

    const nguongnhietdo = Number(document.getElementById("nguongnhietdo").value);
    const nguongdoam = Number(document.getElementById("nguongdoam").value);
    const nguonganhsanghoctap = Number(document.getElementById("nguonganhsanghoctap").value);
    const nguonganhsangnghingoi = Number(document.getElementById("nguonganhsangnghingoi").value);
    const chedohethong = document.getElementById("chedohethong").value;

    await csdl.ref("roomguard/settings").update({
        nguongnhietdo: nguongnhietdo,
        nguongdoam: nguongdoam,
        nguonganhsanghoctap: nguonganhsanghoctap,
        nguonganhsangnghingoi: nguonganhsangnghingoi,
        chedohethong: chedohethong
    });

    await csdl.ref("roomguard/data").update({
        mode: chedohethong,
        updatedAt: Math.floor(Date.now() / 1000)
    });

    ghilichsu("Admin cập nhật cài đặt hệ thống.");
    alert("Đã lưu cài đặt.");
}

function capnhatgiaodiendashboard(data) {
    const nhietdo = Number(data.temperature ?? 0);
    const doam = Number(data.humidity ?? 0);
    const anhsang = Number(data.light ?? 0);
    const chedo = data.mode || "nghi_ngoi";

    const giatrinhietdo = document.getElementById("giatrinhietdo");
    const giatridoam = document.getElementById("giatridoam");
    const giatrianhsang = document.getElementById("giatrianhsang");
    const giatrichedo = document.getElementById("giatrichedo");

    if (giatrinhietdo) giatrinhietdo.textContent = nhietdo.toFixed(1);
    if (giatridoam) giatridoam.textContent = doam.toFixed(0);
    if (giatrianhsang) giatrianhsang.textContent = anhsang.toFixed(0);
    if (giatrichedo) giatrichedo.textContent = chedo === "hoc_tap" ? "HỌC TẬP" : "NGHỈ NGƠI";

    const canhbao = kiemtracanhbao(nhietdo, doam, anhsang, chedo);
    const khungtrangthai = document.getElementById("trangthaihethong");
    const soluongcanhbao = document.getElementById("soluongcanhbao");

    if (canhbao) {
        if (khungtrangthai) {
            khungtrangthai.className = "status-banner danger";
            khungtrangthai.innerHTML = `<i class='bx bx-error'></i> CẢNH BÁO: Phát hiện thông số vượt ngưỡng!`;
        }
        if (soluongcanhbao) soluongcanhbao.textContent = "1";
    } else {
        if (khungtrangthai) {
            khungtrangthai.className = "status-banner good";
            khungtrangthai.innerHTML = `<i class='bx bx-check-shield'></i> HỆ THỐNG HOẠT ĐỘNG BÌNH THƯỜNG`;
        }
        if (soluongcanhbao) soluongcanhbao.textContent = "0";
    }

    const cardnhietdo = document.getElementById("cardnhietdo");
    const carddoam = document.getElementById("carddoam");
    const cardanhsang = document.getElementById("cardanhsang");

    if (cardnhietdo) cardnhietdo.style.borderColor = (nhietdo < 20 || nhietdo > 30) ? "var(--danger)" : "var(--glass-border)";
    if (carddoam) carddoam.style.borderColor = (doam < 35 || doam > 65) ? "var(--danger)" : "var(--glass-border)";
    if (cardanhsang) cardanhsang.style.borderColor = kiemtraanhsangcanhbao(anhsang, chedo) ? "var(--danger)" : "var(--glass-border)";
}

function kiemtracanhbao(nhietdo, doam, anhsang, chedo) {
    const nhietdoxau = nhietdo < 20 || nhietdo > 30;
    const doamxau = doam < 35 || doam > 65;
    const anhsangxau = kiemtraanhsangcanhbao(anhsang, chedo);

    return nhietdoxau || doamxau || anhsangxau;
}

function kiemtraanhsangcanhbao(anhsang, chedo) {
    if (chedo === "hoc_tap") {
        return anhsang < 300 || anhsang > 900;
    }

    return anhsang < 100 || anhsang > 250;
}

document.addEventListener("click", function (e) {
    const cardchedo = e.target.closest("#cardchedo");
    if (!cardchedo) return;

    if (!thongtinnguoidung || thongtinnguoidung.vaitro !== "admin") {
        alert("Chỉ admin mới được đổi chế độ.");
        return;
    }

    const chedohientai = dulieuphong?.mode || "nghi_ngoi";
    const chedomoi = chedohientai === "hoc_tap" ? "nghi_ngoi" : "hoc_tap";

    csdl.ref("roomguard/data").update({
        mode: chedomoi,
        updatedAt: Math.floor(Date.now() / 1000)
    });

    ghilichsu("Đổi chế độ sang " + (chedomoi === "hoc_tap" ? "Học tập" : "Nghỉ ngơi"));
});

function ghilichsu(noidung) {
    if (!dulieuphong) return;

    csdl.ref("roomguard/history").push({
        temperature: Number(dulieuphong.temperature || 0),
        humidity: Number(dulieuphong.humidity || 0),
        light: Number(dulieuphong.light || 0),
        mode: dulieuphong.mode || "nghi_ngoi",
        noidung: noidung,
        updatedAt: Math.floor(Date.now() / 1000)
    });
}

// ================= LỊCH SỬ DATA =================

function doclichsu() {
    csdl.ref("roomguard/history").limitToLast(2000).on("value", function (snapshot) {
        tatcalichsu = chuyendulieulichsu(snapshot.val());

        hienthibieudonho(tatcalichsu);
        capnhatthongke();

        const tranglichsu = document.getElementById("tranglichsu");
        if (tranglichsu && tranglichsu.classList.contains("active")) {
            hienthilichsu(tatcalichsu);
        }
    });
}

function chuyendulieulichsu(dulieu) {
    if (!dulieu) return [];

    return Object.values(dulieu)
        .map(function (item) {
            const nhietdo = Number(item.temperature ?? 0);
            const doam = Number(item.humidity ?? 0);
            const anhsang = Number(item.light ?? 0);
            const chedo = item.mode || "nghi_ngoi";
            const thoigiancapnhat = Number(item.updatedAt ?? 0);
            const ngaygio = thoigiancapnhat > 0 ? new Date(thoigiancapnhat * 1000) : new Date();
            const canhbao = kiemtracanhbao(nhietdo, doam, anhsang, chedo);

            return {
                thoigian: ngaygio.toLocaleTimeString("vi-VN", { hour12: false }),
                ngay: ngaygio.toLocaleDateString("vi-VN"),
                ngaygio: ngaygio,
                thoigiancapnhat: thoigiancapnhat,
                nhietdo: nhietdo,
                doam: doam,
                anhsang: anhsang,
                chedo: chedo,
                canhbao: canhbao,
                trangthai: canhbao ? "Cảnh báo" : "Bình thường",
                loptrangthai: canhbao ? "alert" : "normal"
            };
        })
        .filter(function (item) {
            return item.thoigiancapnhat > 0;
        })
        .sort(function (a, b) {
            return b.thoigiancapnhat - a.thoigiancapnhat;
        });
}

// ================= BIỂU ĐỒ =================

function khoitaobieudo() {
    if (typeof Chart === "undefined") return;

    Chart.defaults.color = "#94a3b8";
    Chart.defaults.font.family = "'Outfit', sans-serif";

    const caidatbieudonho = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            x: { display: false },
            y: { display: false }
        },
        elements: {
            point: { radius: 0 },
            line: { borderWidth: 2 }
        }
    };

    const canvasnhietdo = document.getElementById("bieudonhietdo");
    const canvasdoam = document.getElementById("bieudodoam");
    const canvasanhsang = document.getElementById("bieudoanhsang");

    if (canvasnhietdo) {
        bieudonhietdo = new Chart(canvasnhietdo.getContext("2d"), {
            type: "line",
            data: { labels: [], datasets: [] },
            options: caidatbieudonho
        });
    }

    if (canvasdoam) {
        bieudodoam = new Chart(canvasdoam.getContext("2d"), {
            type: "line",
            data: { labels: [], datasets: [] },
            options: caidatbieudonho
        });
    }

    if (canvasanhsang) {
        bieudoanhsang = new Chart(canvasanhsang.getContext("2d"), {
            type: "line",
            data: { labels: [], datasets: [] },
            options: caidatbieudonho
        });
    }
}

function hienthibieudonho(dulieu) {
    const dulieubieudo = dulieu.slice(0, 20).reverse();

    capnhatbieudonho(bieudonhietdo, dulieubieudo, "nhietdo", maunhietdo, maunennhietdo);
    capnhatbieudonho(bieudodoam, dulieubieudo, "doam", maundoam, maunendoam);
    capnhatbieudonho(bieudoanhsang, dulieubieudo, "anhsang", mauanhsang, maunenanhsang);
}

function capnhatbieudonho(bieudo, dulieu, tentruong, mauvien, maunen) {
    if (!bieudo) return;

    bieudo.data = {
        labels: dulieu.map(x => x.thoigian),
        datasets: [{
            data: dulieu.map(x => x[tentruong]),
            borderColor: mauvien,
            backgroundColor: maunen,
            fill: true,
            tension: 0.4
        }]
    };

    bieudo.update();
}

// ================= THỐNG KÊ =================

function khoitaongaythang() {
    const homnay = new Date();
    const ngay = `${homnay.getFullYear()}-${String(homnay.getMonth() + 1).padStart(2, "0")}-${String(homnay.getDate()).padStart(2, "0")}`;
    const thang = `${homnay.getFullYear()}-${String(homnay.getMonth() + 1).padStart(2, "0")}`;

    const onhapngay = document.getElementById("chonngay");
    const onhapthang = document.getElementById("chonthang");

    if (onhapngay) onhapngay.value = ngay;
    if (onhapthang) onhapthang.value = thang;

    const nutthongke = document.querySelectorAll(".chart-actions button");
    const khungchonngay = document.getElementById("khungchonngay");

    nutthongke.forEach(function (nut) {
        nut.addEventListener("click", function () {
            nutthongke.forEach(n => n.classList.remove("active"));
            nut.classList.add("active");

            chedothongke = nut.getAttribute("data-mode");

            if (chedothongke === "realtime") {
                khungchonngay.style.display = "none";
            } else if (chedothongke === "ngay") {
                khungchonngay.style.display = "flex";
                onhapngay.style.display = "block";
                onhapthang.style.display = "none";
            } else if (chedothongke === "thang") {
                khungchonngay.style.display = "flex";
                onhapngay.style.display = "none";
                onhapthang.style.display = "block";
            }

            capnhatthongke();
        });
    });

    if (onhapngay) onhapngay.addEventListener("change", hienthithongketheongay);
    if (onhapthang) onhapthang.addEventListener("change", hienthithongketheothang);
}

function capnhatthongke() {
    if (chedothongke === "realtime") {
        hienthithongkerealtime();
    } else if (chedothongke === "ngay") {
        hienthithongketheongay();
    } else if (chedothongke === "thang") {
        hienthithongketheothang();
    }
}

function hienthithongkerealtime() {
    const dulieu = tatcalichsu.slice(0, 20).reverse();

    capnhatbieudothongke(
        "line",
        dulieu.map(x => x.thoigian),
        dulieu.map(x => x.nhietdo),
        dulieu.map(x => x.doam),
        dulieu.map(x => x.anhsang),
        "Realtime 20 điểm gần nhất"
    );

    capnhattomtatthongke(dulieu);
}

function hienthithongketheongay() {
    const ngaychon = document.getElementById("chonngay")?.value || "";
    const dulieu = locdulieutheongay(tatcalichsu, ngaychon);
    const nhom = nhomdulieutheogio(dulieu);

    capnhatbieudothongke("bar", nhom.labels, nhom.nhietdo, nhom.doam, nhom.anhsang, "Dữ liệu trung bình từng giờ");
    capnhattomtatthongke(dulieu);
}

function hienthithongketheothang() {
    const thangchon = document.getElementById("chonthang")?.value || "";
    const dulieu = locdulieutheothang(tatcalichsu, thangchon);
    const nhom = nhomdulieutheongay(dulieu);

    capnhatbieudothongke("bar", nhom.labels, nhom.nhietdo, nhom.doam, nhom.anhsang, "Dữ liệu trung bình từng ngày");
    capnhattomtatthongke(dulieu);
}

function capnhatbieudothongke(kieu, labels, dulieunhietdo, dulieudoam, dulieuanhsang, tieude) {
    const canvas = document.getElementById("bieudothongke");
    if (!canvas) return;

    if (bieudothongke) bieudothongke.destroy();

    const laLine = kieu === "line";

    bieudothongke = new Chart(canvas.getContext("2d"), {
        type: kieu,
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Nhiệt độ",
                    data: dulieunhietdo,
                    borderColor: maunhietdo,
                    backgroundColor: laLine ? maunennhietdo : maunhietdo,
                    tension: 0.4,
                    fill: laLine,
                    yAxisID: "y"
                },
                {
                    label: "Độ ẩm",
                    data: dulieudoam,
                    borderColor: maundoam,
                    backgroundColor: laLine ? maunendoam : maundoam,
                    tension: 0.4,
                    fill: laLine,
                    yAxisID: "y"
                },
                {
                    label: "Ánh sáng",
                    data: dulieuanhsang,
                    borderColor: mauanhsang,
                    backgroundColor: laLine ? maunenanhsang : mauanhsang,
                    tension: 0.4,
                    fill: laLine,
                    yAxisID: "y1"
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: "#94a3b8" }
                },
                title: {
                    display: true,
                    text: tieude,
                    color: "#94a3b8"
                }
            },
            scales: {
                x: {
                    grid: { color: "rgba(255,255,255,0.05)" }
                },
                y: {
                    type: "linear",
                    position: "left",
                    grid: { color: "rgba(255,255,255,0.05)" }
                },
                y1: {
                    type: "linear",
                    position: "right",
                    grid: { drawOnChartArea: false }
                }
            }
        }
    });
}

function capnhattomtatthongke(dulieu) {
    const dem = dulieu.length;

    if (dem === 0) {
        document.getElementById("tbnhietdo").innerHTML = `-- <small>°C</small>`;
        document.getElementById("tbdoam").innerHTML = `-- <small>%</small>`;
        document.getElementById("tbanhsang").innerHTML = `-- <small>Lux</small>`;
        document.getElementById("sobanghi").textContent = "0";
        return;
    }

    const tongnhietdo = dulieu.reduce((tong, x) => tong + x.nhietdo, 0);
    const tongdoam = dulieu.reduce((tong, x) => tong + x.doam, 0);
    const tonganhsang = dulieu.reduce((tong, x) => tong + x.anhsang, 0);

    document.getElementById("tbnhietdo").innerHTML = `${(tongnhietdo / dem).toFixed(1)} <small>°C</small>`;
    document.getElementById("tbdoam").innerHTML = `${(tongdoam / dem).toFixed(0)} <small>%</small>`;
    document.getElementById("tbanhsang").innerHTML = `${(tonganhsang / dem).toFixed(0)} <small>Lux</small>`;
    document.getElementById("sobanghi").textContent = dem;
}

function locdulieutheongay(dulieu, ngaychon) {
    if (!ngaychon) return [];

    return dulieu.filter(function (item) {
        const ngay = item.ngaygio;
        const ngaydangso = `${ngay.getFullYear()}-${String(ngay.getMonth() + 1).padStart(2, "0")}-${String(ngay.getDate()).padStart(2, "0")}`;
        return ngaydangso === ngaychon;
    });
}

function locdulieutheothang(dulieu, thangchon) {
    if (!thangchon) return [];

    return dulieu.filter(function (item) {
        const ngay = item.ngaygio;
        const thangdangso = `${ngay.getFullYear()}-${String(ngay.getMonth() + 1).padStart(2, "0")}`;
        return thangdangso === thangchon;
    });
}

function nhomdulieutheogio(dulieu) {
    const mang = Array.from({ length: 24 }, function () {
        return { dem: 0, nhietdo: 0, doam: 0, anhsang: 0 };
    });

    dulieu.forEach(function (item) {
        const gio = item.ngaygio.getHours();

        mang[gio].dem++;
        mang[gio].nhietdo += item.nhietdo;
        mang[gio].doam += item.doam;
        mang[gio].anhsang += item.anhsang;
    });

    const ketqua = {
        labels: [],
        nhietdo: [],
        doam: [],
        anhsang: []
    };

    for (let i = 0; i < 24; i++) {
        ketqua.labels.push(String(i).padStart(2, "0") + ":00");

        if (mang[i].dem > 0) {
            ketqua.nhietdo.push(mang[i].nhietdo / mang[i].dem);
            ketqua.doam.push(mang[i].doam / mang[i].dem);
            ketqua.anhsang.push(mang[i].anhsang / mang[i].dem);
        } else {
            ketqua.nhietdo.push(null);
            ketqua.doam.push(null);
            ketqua.anhsang.push(null);
        }
    }

    return ketqua;
}

function nhomdulieutheongay(dulieu) {
    if (dulieu.length === 0) {
        return { labels: [], nhietdo: [], doam: [], anhsang: [] };
    }

    const nam = dulieu[0].ngaygio.getFullYear();
    const thang = dulieu[0].ngaygio.getMonth();
    const songay = new Date(nam, thang + 1, 0).getDate();

    const mang = Array.from({ length: songay + 1 }, function () {
        return { dem: 0, nhietdo: 0, doam: 0, anhsang: 0 };
    });

    dulieu.forEach(function (item) {
        const ngay = item.ngaygio.getDate();

        mang[ngay].dem++;
        mang[ngay].nhietdo += item.nhietdo;
        mang[ngay].doam += item.doam;
        mang[ngay].anhsang += item.anhsang;
    });

    const ketqua = {
        labels: [],
        nhietdo: [],
        doam: [],
        anhsang: []
    };

    for (let i = 1; i <= songay; i++) {
        ketqua.labels.push("Ngày " + i);

        if (mang[i].dem > 0) {
            ketqua.nhietdo.push(mang[i].nhietdo / mang[i].dem);
            ketqua.doam.push(mang[i].doam / mang[i].dem);
            ketqua.anhsang.push(mang[i].anhsang / mang[i].dem);
        } else {
            ketqua.nhietdo.push(null);
            ketqua.doam.push(null);
            ketqua.anhsang.push(null);
        }
    }

    return ketqua;
}

// ================= LỊCH SỬ UI =================

function hienthilichsu(dulieu) {
    const khung = document.getElementById("danhsachlichsu");
    if (!khung) return;

    const dulieudaloc = loclichsu(dulieu);

    if (dulieudaloc.length === 0) {
        khung.innerHTML = `
            <div class="empty-state">
                <i class='bx bx-folder-open'></i>
                <p>Không tìm thấy bản ghi nào phù hợp.</p>
            </div>
        `;
        return;
    }

    const nhom = nhomlichsutheongayvacheo(dulieudaloc);
    let html = "";

    for (const ngay in nhom) {
        const hoctap = nhom[ngay].hoc_tap || [];
        const nghingoi = nhom[ngay].nghi_ngoi || [];
        const tong = hoctap.length + nghingoi.length;

        html += `
            <div class="history-date-group mb-3">
                <div class="date-group-header">
                    <span>
                        <i class='bx bx-calendar'></i>
                        ${ngay}
                    </span>
                    <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 500;">
                        ${tong} bản ghi
                    </span>
                </div>

                <div class="mode-groups-container">
                    ${taonhomchedo("hoc_tap", hoctap)}
                    ${taonhomchedo("nghi_ngoi", nghingoi)}
                </div>
            </div>
        `;
    }

    khung.innerHTML = html;
}

function loclichsu(dulieu) {
    let ketqua = [...dulieu];

    const locngay = document.getElementById("locngaylichsu");
    const loctrangthai = document.getElementById("loctrangthailichsu");

    if (locngay && locngay.value) {
        ketqua = locdulieutheongay(ketqua, locngay.value);
    }

    if (loctrangthai && loctrangthai.value !== "all") {
        if (loctrangthai.value === "normal") {
            ketqua = ketqua.filter(x => !x.canhbao);
        }

        if (loctrangthai.value === "warning") {
            ketqua = ketqua.filter(x => x.canhbao);
        }
    }

    return ketqua;
}

function nhomlichsutheongayvacheo(dulieu) {
    const nhom = {};

    dulieu.forEach(function (item) {
        if (!nhom[item.ngay]) {
            nhom[item.ngay] = {
                hoc_tap: [],
                nghi_ngoi: []
            };
        }

        if (item.chedo === "hoc_tap") {
            nhom[item.ngay].hoc_tap.push(item);
        } else {
            nhom[item.ngay].nghi_ngoi.push(item);
        }
    });

    return nhom;
}

function taonhomchedo(chedo, dulieu) {
    const tenchedo = chedo === "hoc_tap" ? "HỌC TẬP" : "NGHỈ NGƠI";
    const icon = chedo === "hoc_tap" ? "bx-book-reader" : "bx-coffee";
    const lopchedo = chedo === "hoc_tap" ? "mode-hoc-tap" : "mode-nghi-ngoi";

    let lopactive = "";
    if (chedolichsu !== "all") {
        lopactive = chedolichsu === chedo ? "active-mode" : "dimmed-mode";
    }

    let danhsach = "";

    if (dulieu.length === 0) {
        danhsach = `
            <div class="empty-mode-text">
                Không có dữ liệu cho chế độ này
            </div>
        `;
    } else {
        danhsach = `
            <div class="record-list">
                ${dulieu.map(taodonglichsu).join("")}
            </div>
        `;
    }

    return `
        <div class="mode-group ${lopchedo} ${lopactive}">
            <div class="mode-group-header">
                <i class='bx ${icon}'></i>
                <span>${tenchedo}</span>
                <span class="dem-banghi">${dulieu.length}</span>
            </div>

            ${danhsach}
        </div>
    `;
}

function taodonglichsu(item) {
    return `
        <div class="record-item">
            <div class="record-item-top">
                <div class="record-time">
                    <i class='bx bx-time-five'></i>
                    ${item.thoigian}
                </div>

                <span class="badge-status ${item.loptrangthai}">
                    ${item.trangthai}
                </span>
            </div>

            <div class="record-item-bottom">
                <span title="Nhiệt độ">
                    <i class='bx bxs-thermometer' style="color: var(--color-temp);"></i>
                    ${item.nhietdo.toFixed(1)}°C
                </span>

                <span title="Độ ẩm">
                    <i class='bx bx-water' style="color: var(--color-hum);"></i>
                    ${item.doam.toFixed(0)}%
                </span>

                <span title="Ánh sáng">
                    <i class='bx bxs-bulb' style="color: var(--color-lux);"></i>
                    ${item.anhsang.toFixed(0)} Lux
                </span>
            </div>
        </div>
    `;
}

document.addEventListener("change", function (e) {
    if (e.target.id === "locngaylichsu" || e.target.id === "loctrangthailichsu") {
        hienthilichsu(tatcalichsu);
    }
});

document.addEventListener("click", function (e) {
    const nuttab = e.target.closest(".btn-tab");
    if (!nuttab) return;

    document.querySelectorAll(".btn-tab").forEach(function (nut) {
        nut.classList.remove("active");
    });

    nuttab.classList.add("active");
    chedolichsu = nuttab.getAttribute("data-mode") || "all";
    hienthilichsu(tatcalichsu);
});

// ================= USER + NÂNG CẤP ADMIN =================

function docdanhsachnguoidung() {
    csdl.ref("roomguard/users").on("value", function (snapshot) {
        tatcanguoidung = snapshot.val() || {};

        if (nguoidunghientai && tatcanguoidung[nguoidunghientai.uid]) {
            thongtinnguoidung = tatcanguoidung[nguoidunghientai.uid];

            if (thongtinnguoidung.gmail && thongtinnguoidung.gmail.toLowerCase() === gmailquantri.toLowerCase()) {
                thongtinnguoidung.vaitro = "admin";
            }

            capnhatthongtintaikhoan();
        }

        hienthiphannangcapadmin();
    });
}

function hienthiphannangcapadmin() {
    const khung = document.getElementById("khungnangcap");
    if (!khung || !thongtinnguoidung) return;

    const laadmin = thongtinnguoidung.vaitro === "admin";
    const trangthai = thongtinnguoidung.trangthaiyeucau || "none";

    if (laadmin) {
        const danhsach = Object.values(tatcanguoidung).filter(function (user) {
            return user.trangthaiyeucau === "cho_duyet";
        });

        if (danhsach.length === 0) {
            khung.innerHTML = `
                <div class="thong-bao-nang-cap thanhcong">
                    Bạn đang là admin. Hiện chưa có yêu cầu nâng cấp nào.
                </div>
            `;
            return;
        }

        khung.innerHTML = `
            <div class="danhsach-yeucau">
                ${danhsach.map(function (user) {
                    return `
                        <div class="dong-yeu-cau">
                            <div>
                                <h4>${user.hoten || "Không rõ tên"}</h4>
                                <p>${user.gmail || ""}</p>
                                <small>${user.lydodangky || "Không có lý do đăng ký"}</small>
                            </div>

                            <button class="btn btn-primary" onclick="duyetyeucauadmin('${user.uid}')">
                                Duyệt & gửi OTP
                            </button>
                        </div>
                    `;
                }).join("")}
            </div>
        `;
        return;
    }

    if (trangthai === "cho_duyet") {
        khung.innerHTML = `
            <div class="thong-bao-nang-cap dangcho">
                Yêu cầu của bạn đang chờ admin duyệt.
            </div>
        `;
        return;
    }

    if (trangthai === "cho_xac_thuc_otp") {
        const conlai = Math.max(0, Math.floor((Number(thongtinnguoidung.thoigianhethanotp || 0) - Date.now()) / 1000));

        if (conlai <= 0) {
            khung.innerHTML = `
                <div class="thong-bao-nang-cap dangcho">
                    Mã OTP đã hết hạn. Bạn cần gửi yêu cầu nâng cấp lại và chờ admin duyệt lại.
                </div>
                <button class="btn btn-primary" onclick="guiyeucauadmin()">Yêu cầu nâng cấp lại</button>
            `;
            return;
        }

        khung.innerHTML = `
            <div class="thong-bao-nang-cap dangcho">
                Admin đã duyệt. Mã OTP đã gửi về Gmail của bạn. Còn ${conlai} giây.
            </div>

            <div class="form-group">
                <label>Nhập mã OTP</label>
                <input type="text" id="maotpnhap" class="form-control" placeholder="Nhập mã OTP 6 số">
            </div>

            <button class="btn btn-primary" onclick="xacnhanotp()">Xác nhận OTP</button>
        `;
        return;
    }

    if (trangthai === "da_duyet") {
        khung.innerHTML = `
            <div class="thong-bao-nang-cap thanhcong">
                Tài khoản của bạn đã được nâng cấp lên admin.
            </div>
        `;
        return;
    }

    khung.innerHTML = `
        <div class="thong-bao-nang-cap">
            Tài khoản hiện tại là user. Bạn có thể gửi yêu cầu để admin duyệt nâng cấp quyền.
        </div>
        <button class="btn btn-primary" onclick="guiyeucauadmin()">Yêu cầu nâng cấp Admin</button>
    `;
}

async function guiyeucauadmin() {
    if (!nguoidunghientai) return;

    await csdl.ref("roomguard/users/" + nguoidunghientai.uid).update({
        yeucauadmin: true,
        trangthaiyeucau: "cho_duyet",
        maotp: "",
        thoigianhethanotp: 0,
        thoigianyeucau: Date.now()
    });

    alert("Đã gửi yêu cầu nâng cấp. Vui lòng chờ admin duyệt.");
}

async function duyetyeucauadmin(uid) {
    if (!thongtinnguoidung || thongtinnguoidung.vaitro !== "admin") {
        alert("Bạn không có quyền duyệt yêu cầu.");
        return;
    }

    const snap = await csdl.ref("roomguard/users/" + uid).once("value");
    const user = snap.val();

    if (!user) {
        alert("Không tìm thấy user.");
        return;
    }

    const maotp = taomaotp();
    const thoigianhethanotp = Date.now() + 120000;

    try {
        await guiotpquagmail(user.hoten, user.gmail, maotp);

        await csdl.ref("roomguard/users/" + uid).update({
            maotp: maotp,
            thoigianhethanotp: thoigianhethanotp,
            trangthaiyeucau: "cho_xac_thuc_otp",
            yeucauadmin: true
        });

        alert("Đã duyệt và gửi OTP về Gmail của user.");

    } catch (loi) {
        console.log("Lỗi gửi OTP:", loi);
        alert("Không gửi được OTP. Kiểm tra lại EmailJS.");
    }
}

function taomaotp() {
    return String(Math.floor(100000 + Math.random() * 900000));
}

async function guiotpquagmail(hoten, gmail, maotp) {
    const thamso = {
        hoten: hoten || "Người dùng",
        gmail: gmail,
        maotp: maotp,
        thoigian: "120"
    };

    console.log("Dữ liệu gửi EmailJS:", thamso);
    return emailjs.send(serviceid, templateid, thamso);
}

async function xacnhanotp() {
    if (!nguoidunghientai) return;

    const onhap = document.getElementById("maotpnhap");
    const maotpnhap = onhap ? onhap.value.trim() : "";

    if (maotpnhap === "") {
        alert("Vui lòng nhập mã OTP.");
        return;
    }

    const snap = await csdl.ref("roomguard/users/" + nguoidunghientai.uid).once("value");
    const user = snap.val();

    if (!user) {
        alert("Không tìm thấy thông tin tài khoản.");
        return;
    }

    if (Date.now() > Number(user.thoigianhethanotp || 0)) {
        await csdl.ref("roomguard/users/" + nguoidunghientai.uid).update({
            maotp: "",
            thoigianhethanotp: 0,
            yeucauadmin: false,
            trangthaiyeucau: "none"
        });

        alert("Mã OTP đã hết hạn. Vui lòng gửi yêu cầu nâng cấp lại và chờ admin duyệt.");
        return;
    }

    if (maotpnhap !== String(user.maotp)) {
        alert("Mã OTP không đúng.");
        return;
    }

    await csdl.ref("roomguard/users/" + nguoidunghientai.uid).update({
        vaitro: "admin",
        yeucauadmin: false,
        trangthaiyeucau: "da_duyet",
        maotp: "",
        thoigianhethanotp: 0
    });

    alert("Xác thực thành công. Tài khoản đã được nâng cấp lên admin.");
}

// ================= CHATBOT =================

function khoitaochatbot() {
    const onhapchat = document.getElementById("noidungchat");
    const nutguichat = document.getElementById("nutguichat");

    if (nutguichat) {
        nutguichat.addEventListener("click", guichat);
    }

    if (onhapchat) {
        onhapchat.addEventListener("keypress", function (e) {
            if (e.key === "Enter") {
                guichat();
            }
        });
    }
}

function guichat() {
    const onhapchat = document.getElementById("noidungchat");
    if (!onhapchat) return;

    const noidung = onhapchat.value.trim();
    if (noidung === "") return;

    themtinnhan(noidung, "user");

    const traloi = taocautraloichatbot(noidung);

    setTimeout(function () {
        themtinnhan(traloi, "bot");
    }, 400);

    onhapchat.value = "";
}

function themtinnhan(noidung, nguoinhan) {
    const khungchat = document.getElementById("khungchat");
    if (!khungchat) return;

    const dong = document.createElement("div");
    dong.className = "message " + (nguoinhan === "user" ? "user-msg" : "bot-msg");

    dong.innerHTML = `
        <div class="msg-bubble">${noidung}</div>
    `;

    khungchat.appendChild(dong);
    khungchat.scrollTop = khungchat.scrollHeight;
}

function taocautraloichatbot(cauhoi) {
    const chuoi = cauhoi.toLowerCase();

    if (!dulieuphong) {
        return "Hiện tại mình chưa nhận được dữ liệu từ hệ thống.";
    }

    const nhietdo = Number(dulieuphong.temperature || 0);
    const doam = Number(dulieuphong.humidity || 0);
    const anhsang = Number(dulieuphong.light || 0);
    const chedo = dulieuphong.mode || "nghi_ngoi";
    const tenchedo = chedo === "hoc_tap" ? "học tập" : "nghỉ ngơi";

    if (chuoi.includes("nhiệt") || chuoi.includes("nhiet")) {
        if (nhietdo < 20) return `Nhiệt độ hiện tại là ${nhietdo.toFixed(1)}°C, đang hơi thấp so với mức phù hợp.`;
        if (nhietdo > 30) return `Nhiệt độ hiện tại là ${nhietdo.toFixed(1)}°C, đang cao hơn mức bình thường.`;
        return `Nhiệt độ hiện tại là ${nhietdo.toFixed(1)}°C, đang ở mức bình thường.`;
    }

    if (chuoi.includes("ẩm") || chuoi.includes("am")) {
        if (doam < 35) return `Độ ẩm hiện tại là ${doam.toFixed(0)}%, hơi thấp nên không khí có thể bị khô.`;
        if (doam > 65) return `Độ ẩm hiện tại là ${doam.toFixed(0)}%, đang cao hơn mức phù hợp.`;
        return `Độ ẩm hiện tại là ${doam.toFixed(0)}%, đang ở mức ổn định.`;
    }

    if (chuoi.includes("sáng") || chuoi.includes("sang") || chuoi.includes("ánh") || chuoi.includes("anh") || chuoi.includes("lux")) {
        if (chedo === "hoc_tap") {
            if (anhsang < 300) return `Ánh sáng hiện tại là ${anhsang.toFixed(0)} Lux, hơi thấp cho chế độ học tập.`;
            if (anhsang > 900) return `Ánh sáng hiện tại là ${anhsang.toFixed(0)} Lux, hơi cao cho chế độ học tập.`;
            return `Ánh sáng hiện tại là ${anhsang.toFixed(0)} Lux, phù hợp cho chế độ học tập.`;
        }

        if (anhsang < 100) return `Ánh sáng hiện tại là ${anhsang.toFixed(0)} Lux, hơi thấp cho chế độ nghỉ ngơi.`;
        if (anhsang > 250) return `Ánh sáng hiện tại là ${anhsang.toFixed(0)} Lux, hơi cao cho chế độ nghỉ ngơi.`;
        return `Ánh sáng hiện tại là ${anhsang.toFixed(0)} Lux, phù hợp cho chế độ nghỉ ngơi.`;
    }

    if (chuoi.includes("chế độ") || chuoi.includes("che do") || chuoi.includes("mode")) {
        return `Hệ thống hiện đang ở chế độ ${tenchedo}.`;
    }

    if (chuoi.includes("trạng thái") || chuoi.includes("trang thai") || chuoi.includes("phòng") || chuoi.includes("phong")) {
        const canhbao = kiemtracanhbao(nhietdo, doam, anhsang, chedo);

        if (canhbao) {
            return `Phòng đang có thông số vượt ngưỡng. Nhiệt độ ${nhietdo.toFixed(1)}°C, độ ẩm ${doam.toFixed(0)}%, ánh sáng ${anhsang.toFixed(0)} Lux, chế độ ${tenchedo}.`;
        }

        return `Phòng đang hoạt động bình thường. Nhiệt độ ${nhietdo.toFixed(1)}°C, độ ẩm ${doam.toFixed(0)}%, ánh sáng ${anhsang.toFixed(0)} Lux, chế độ ${tenchedo}.`;
    }

    if (chuoi.includes("admin") || chuoi.includes("nâng cấp") || chuoi.includes("nang cap") || chuoi.includes("otp")) {
        return "Bạn có thể vào mục Cài Đặt để gửi yêu cầu nâng cấp admin. Sau khi admin duyệt, hệ thống sẽ gửi mã OTP về Gmail của bạn.";
    }

    return "Mình có thể hỗ trợ xem nhiệt độ, độ ẩm, ánh sáng, chế độ hoạt động, trạng thái phòng và hướng dẫn nâng cấp admin.";
}

