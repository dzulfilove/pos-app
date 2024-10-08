import React, { useEffect, useState } from "react";
import "../../styles/card.css";
import BarChartComponent from "../../component/dashboard/chart";
import dayjs from "dayjs";
import { collection, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../config/database";
import { FaLuggageCart } from "react-icons/fa";
import { GiReceiveMoney } from "react-icons/gi";
import Swal from "sweetalert2";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import AOS from "aos";
import "aos/dist/aos.css";
function Dashboard() {
  const [dataTransaction, setDataTransaction] = useState([]);
  const [transUncheck, setTransUncheck] = useState([]);
  const [dataTunai, setDataTunai] = useState([]);
  const [dataNonTunai, setDataNonTunai] = useState([]);
  const [tanggal, setTanggal] = useState(
    dayjs().locale("id").format("DD/MM/YYYY")
  );
  const [bulan, setBulan] = useState(dayjs().format("MMMM"));
  const [tahun, setTahun] = useState(dayjs().format("YYYY"));
  const [totalNominal, setTotalNominal] = useState(0);
  const [totalNominalTunai, setTotalNominalTunai] = useState(0);
  const [totalQris, setTotalQris] = useState(0);
  const [totalTransfer, setTotalTransfer] = useState(0);
  const [totalNominalNonTunai, setTotalNominalNonTunai] = useState(0);
  const [itemTerlaris, setItemTerlaris] = useState([]);
  const [dataBulan, setDataBulan] = useState([]);
  const cabang = sessionStorage.getItem("cabang");

  useEffect(() => {
    getTransactions(bulan, tahun);
    AOS.init({ duration: 700 });
  }, []);

  const getTransactions = async (year) => {
    try {
      // Buat query dengan filter where untuk tahun
      const transactionsQuery = query(
        collection(db, `transactions${cabang}`),
        where("year", "==", year)
      );

      const querySnapshot = await getDocs(transactionsQuery);

      // Jika tidak ada dokumen yang ditemukan, kembalikan array kosong
      if (querySnapshot.empty) {
        console.log("No transactions found for the given year.");
        setDataBulan([]);
        return [];
      }

      const transactions = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const data = doc.data();

          // Fetch data item berdasarkan refItem
          const itemRef = data.refItem;
          const itemDoc = await getDoc(itemRef);
          const itemData = itemDoc.data();

          // Menghitung total harga dari price * quantity
          const total = data.price * data.quantity;

          return {
            id: doc.id,
            ...data,
            item: itemData,
            total: total, // Tambahkan properti total
          };
        })
      );

      // Mengelompokkan transaksi berdasarkan bulan
      const groupedByMonth = transactions.reduce((acc, transaction) => {
        const month = transaction.month;
        if (!acc[month]) {
          acc[month] = {
            totalNominal: 0,
            totalOrder: 0,
          };
        }
        acc[month].totalNominal += transaction.total;
        acc[month].totalOrder += 1;
        return acc;
      }, {});

      // Nama bulan dalam bahasa Inggris
      const monthNames = [
        { nama: "Jan.", text: "January" },
        { nama: "Feb.", text: "February" },
        { nama: "Mar.", text: "March" },
        { nama: "Apr.", text: "April" },
        { nama: "Mei", text: "May" },
        { nama: "Juni", text: "June" },
        { nama: "Juli", text: "July" },
        { nama: "Agust.", text: "August" },
        { nama: "Sept.", text: "September" },
        { nama: "Okto.", text: "October" },
        { nama: "Nov.", text: "November" },
        { nama: "Dec.", text: "December" },
      ];

      // Membuat array data bulan dengan nama, totalNominal, dan totalOrder
      const dataBulan = monthNames.map((month, index) => {
        const key = index + 1; // Bulan dimulai dari 1 (January)
        return {
          nama: month.nama,
          text: month.text,
          totalNominal: groupedByMonth[key]?.totalNominal || 0,
          totalOrder: groupedByMonth[key]?.totalOrder || 0,
        };
      });

      setDataBulan(dataBulan);
      console.log("Data Bulan:", dataBulan);
    } catch (e) {
      Swal.fire({
        title: "Error!",
        text: "Gagal mendapatkan data: " + e.message,
        icon: "error",
        confirmButtonText: "OK",
      });
      return [];
    }
  };

  function formatRupiah(number) {
    // Mengonversi angka menjadi string dan membalik urutannya
    let numberString = number.toString().split("").reverse().join("");

    // Menambahkan titik setiap 3 digit
    let rupiah = "";
    for (let i = 0; i < numberString.length; i++) {
      if (i > 0 && i % 3 === 0) {
        rupiah += ".";
      }
      rupiah += numberString[i];
    }

    // Membalik urutan kembali dan menambahkan prefix "Rp"
    return "Rp " + rupiah.split("").reverse().join("");
  }

  var settings = {
    dots: false,
    infinite: true,
    autoplay: true,
    speed: 2000,
    autoplaySpeed: 3000,
    cssEase: "linear",
    slidesToShow: 1,
    slidesToScroll: 1,
  };
  console.log(itemTerlaris);
  return (
    <div>
      <div className="w-full h-full flex flex-col justify-start items-center ">
        <div className="w-full flex justify-start gap-10 items-center h-full">
          <div
            data-aos="fade-up"
            data-aos-delay="50"
            className="cookieCard w-[50%]"
          >
            <div className="cookieDescription">
              <h3 className="text-xl font-medium">
                {dataTransaction.length} Transaksi
              </h3>
            </div>
            <h3 className="text-xs font-normal text-white w-full">
              Total Transaksi {bulan} {tahun}
            </h3>
            <div className="z-[9999] absolute right-[5%] p-4 flex justify-center items-center bg-white  rounded-full">
              <FaLuggageCart className="text-blue-700 text-[2rem]" />
            </div>
          </div>
          <div
            data-aos="fade-up"
            data-aos-delay="150"
            className="w-[50%] h-[8rem] rounded-xl p-3 py-4 shadow-md bg-white flex flex-col justify-between items-center "
          >
            <div className="w-[100%] h-[8rem]  border-l-4 border-l-blue-700 p-3 py-2  bg-white flex  justify-start gap-3 items-center">
              <div className="w-[80%] flex flex-col justify-center gap-4 items-start">
                <div className="w-full flex justify-start gap-4 items-center">
                  <h3 className="text-xl font-medium">
                    {formatRupiah(totalNominal)}
                  </h3>
                </div>
                <div className="w-full flex justify-start gap-4 items-center">
                  <h3 className="text-xs font-normal">
                    Nominal Transaksi {bulan} {tahun}
                  </h3>
                </div>
              </div>
              <div className="w-[80%] flex flex-col justify-center gap-4 items-end">
                <div className=" w-[4rem] h-[4rem] bg-blue-100 rounded-full flex justify-center items-center p-3">
                  <GiReceiveMoney className="text-blue-600 text-[2.2rem]" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          data-aos="fade-up"
          data-aos-delay="350"
          className="w-full flex justify-start items-center mt-10  bg-gradient-to-r from-[#1d4ed8] to-[#a2bbff] p-2 rounded-md"
        >
          <h3 className="text-white text-base font-normal">
            {" "}
            Grafik Penjualan Tahun 2024
          </h3>
        </div>
        <div
          data-aos="fade-up"
          data-aos-delay="550"
          className="w-full flex justify-center items-start mt-5"
        >
          <BarChartComponent />
        </div>
        <div
          data-aos="fade-up"
          data-aos-delay="750"
          className="w-full flex justify-start items-center mt-10  bg-gradient-to-r from-[#1d4ed8] to-[#a2bbff] p-2 rounded-md"
        >
          <h3 className="text-white text-base font-normal">
            {" "}
            Item Terlaku Bulan Ini
          </h3>
        </div>

        <div className="w-full flex justify-center items-start mt-5 gap-6  p-4 rounded-md mb-24">
          {/* <Slider {...settings}>
            <div className="bg-white flex justify-center items-center p-3 w-[15rem] border rounded-xl shadow-lg">
              <div className="bg-white flex flex-col gap-2 justify-center items-start  w-[100%] p-4 border-l-4 border-l-blue-500">
                <h3 className="text-blue-600 text-base font-semibold">
                  Voucher Kuota Tri
                </h3>
                <p className=" text-sm font-normal">Terjual 30 Item</p>
              </div>
            </div>
            <div className="bg-white flex justify-center items-center p-3 w-[15rem] border rounded-xl shadow-lg">
              <div className="bg-white flex flex-col gap-2 justify-center items-start  w-[100%] p-4 border-l-4 border-l-blue-500">
                <h3 className="text-blue-600 text-base font-semibold">
                  Voucher Kuota Tri
                </h3>
                <p className=" text-sm font-normal">Terjual 30 Item</p>
              </div>
            </div>
            <div className="bg-white flex justify-center items-center p-3 w-[15rem] border rounded-xl shadow-lg ">
              <div className="bg-white flex flex-col gap-2 justify-center items-start  w-[100%] p-4 border-l-4 border-l-blue-500">
                <h3 className="text-blue-600 text-base font-semibold">
                  Voucher Kuota Tri
                </h3>
                <p className=" text-sm font-normal">Terjual 30 Item</p>
              </div>
            </div>
          </Slider> */}
          {itemTerlaris.map((data) => (
            <div
              className="bg-gradient-to-r from-blue-600 to-indigo-500 rounded-lg overflow-hidden shadow-xl w-[15rem]"
              key={data.itemId}
            >
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-2 text-white">
                  {data.itemName}
                </h2>
                <p className="text-sm mb-4 text-white font-normal">
                  Terjual {data.totalBarang} {data.unit} dalam{" "}
                  {data.jumlahTransaksi} transaksi
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
