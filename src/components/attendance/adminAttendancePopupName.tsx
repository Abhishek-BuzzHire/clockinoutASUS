import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { format } from "date-fns";

interface AttendanceDay {
  date: string;
  punch_in: string | null;
  punch_out: string | null;
  total_time: string | null;
}

interface EmployeeAttendance {
  emp_id: number;
  employee_name: string;
  attendance: AttendanceDay[];
}

export default function AdminAttendancePopup({ onClose }: { onClose: () => void }) {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<EmployeeAttendance[]>([]);

  const fetchAttendance = async () => {
    if (!startDate || !endDate) return alert("Select both start & end date");

    try {
      setLoading(true);
      const token = Cookies.get("access");

      const res = await axios.get(
        "https://buzzhire.trueledgrr.com/api/admin/emp-total-details/",
        {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
          params: {
            start_date: format(new Date(startDate), "yyyy-MM-dd"),
            end_date: format(new Date(endDate), "yyyy-MM-dd"),
            ids: ""   // empty → fetch all employees
          },
        }
      );

      setData(res.data.emps || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch attendance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlay}>
      <div style={popupBox}>
        <h2>Employee Attendance Report</h2>

        {/* DATE FILTERS */}
        <div style={filters}>
          <div>
            <label>Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>

          <div>
            <label>End Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>

          <button onClick={fetchAttendance} disabled={loading}>
            {loading ? "Loading..." : "Fetch"}
          </button>
          <button onClick={onClose}>Close</button>
        </div>

        {/* TABLE */}
        <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {data.length === 0 && <p>No Data Loaded</p>}

          {data.map(emp => (
            <div key={emp.emp_id} style={{ marginBottom: 30 }}>
              <h3>{emp.employee_name} (ID: {emp.emp_id})</h3>

              <table style={table}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Punch In</th>
                    <th>Punch Out</th>
                    <th>Hours Worked</th>
                  </tr>
                </thead>

                <tbody>
                  {emp.attendance.map(day => (
                    <tr key={day.date}>
                      <td>{day.date}</td>
                      <td>{day.punch_in || "-"}</td>
                      <td>{day.punch_out || "-"}</td>
                      <td>{day.total_time || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

/* SIMPLE STYLING */
const overlay: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999,
};

const popupBox: React.CSSProperties = {
  width: "80%",
  background: "#fff",
  borderRadius: 8,
  padding: 20,
};

const filters: React.CSSProperties = {
  display: "flex",
  gap: 15,
  alignItems: "center",
  marginBottom: 20,
};

const table: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};
