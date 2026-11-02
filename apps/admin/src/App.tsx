import { useState, type ReactNode } from 'react';
import { NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const nav = [
  ['/', 'Dashboard'],
  ['/users', 'Users'],
  ['/agents', 'Agents'],
  ['/wallets', 'Wallets'],
  ['/transactions', 'Transactions'],
  ['/data-plans', 'Data plans'],
  ['/airtime', 'Airtime pricing'],
  ['/electricity', 'Electricity'],
  ['/tv', 'TV'],
  ['/exams', 'Exam pins'],
  ['/cashback', 'Cashback'],
  ['/referrals', 'Referrals'],
  ['/tickets', 'Support tickets'],
  ['/reports', 'Reports'],
  ['/revenue', 'Revenue'],
  ['/settings', 'Settings'],
];

const chart = [
  { d: 'Mon', v: 420000 },
  { d: 'Tue', v: 510000 },
  { d: 'Wed', v: 388000 },
  { d: 'Thu', v: 640000 },
  { d: 'Fri', v: 720000 },
  { d: 'Sat', v: 810000 },
  { d: 'Sun', v: 560000 },
];

function naira(n: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="shell">
      <aside className="side">
        <h1>MADOBIPAY</h1>
        {nav.map(([to, label]) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>
            {label}
          </NavLink>
        ))}
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}

function Table({ rows }: { rows: string[][] }) {
  return (
    <table>
      <thead>
        <tr>{rows[0].map((h) => <th key={h}>{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.slice(1).map((r, i) => (
          <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>
        ))}
      </tbody>
    </table>
  );
}

function Dashboard() {
  return (
    <>
      <h2>Admin dashboard</h2>
      <div className="cards">
        <div className="card"><h3>Daily revenue</h3><p>{naira(1240500)}</p></div>
        <div className="card"><h3>Total users</h3><p>18,420</p></div>
        <div className="card"><h3>Active users</h3><p>6,390</p></div>
        <div className="card"><h3>Tx volume</h3><p>112,004</p></div>
      </div>
      <div className="card" style={{ marginTop: 20, height: 280 }}>
        <h3>Weekly revenue</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chart}>
            <XAxis dataKey="d" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="v" stroke="#FF6F00" fill="#FFC107" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

function Page({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <>
      <h2>{title}</h2>
      <Table rows={rows} />
    </>
  );
}

function Login() {
  const navTo = useNavigate();
  const [email, setEmail] = useState('admin@madobipay.com');
  const [password, setPassword] = useState('');
  return (
    <div className="login">
      <form
        className="panel"
        onSubmit={(e) => {
          e.preventDefault();
          if (email && password) {
            localStorage.setItem('mp.admin', '1');
            navTo('/');
          }
        }}
      >
        <h2>MADOBIPAY Admin</h2>
        <p>Secure operations console</p>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        <button type="submit">Sign in</button>
      </form>
    </div>
  );
}

function Guard({ children }: { children: ReactNode }) {
  if (!localStorage.getItem('mp.admin')) return <Navigate to="/login" replace />;
  return <Shell>{children}</Shell>;
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Guard><Dashboard /></Guard>} />
      <Route path="/users" element={<Guard><Page title="User management" rows={[['Name', 'Phone', 'KYC', 'Status'], ['Chinedu Okeke', '08031234567', 'L1', 'Active'], ['Amaka Bello', '08021239876', 'L2', 'Active']]} /></Guard>} />
      <Route path="/agents" element={<Guard><Page title="Agent management" rows={[['Business', 'Owner', 'Commission', 'Status'], ['Okeke Ventures', 'Chinedu', '1.5%', 'Verified']]} /></Guard>} />
      <Route path="/wallets" element={<Guard><Page title="Wallet management" rows={[['User', 'Available', 'Ledger'], ['Chinedu', naira(248650), naira(248650)]]} /></Guard>} />
      <Route path="/transactions" element={<Guard><Page title="Transactions" rows={[['Ref', 'Service', 'Amount', 'Status'], ['MP2401AIR001', 'Airtime', naira(1000), 'success']]} /></Guard>} />
      <Route path="/data-plans" element={<Guard><Page title="Data plans" rows={[['Network', 'Plan', 'Type', 'Price'], ['MTN', '3GB SME', 'sme', naira(1500)]]} /></Guard>} />
      <Route path="/airtime" element={<Guard><Page title="Airtime pricing" rows={[['Network', 'Discount'], ['MTN', '2%'], ['Airtel', '1.5%']]} /></Guard>} />
      <Route path="/electricity" element={<Guard><Page title="Electricity providers" rows={[['Disco', 'State', 'Status'], ['IKEDC', 'Lagos', 'Live'], ['AEDC', 'Abuja', 'Live']]} /></Guard>} />
      <Route path="/tv" element={<Guard><Page title="TV subscriptions" rows={[['Provider', 'Bouquet', 'Price'], ['DStv', 'Compact', naira(15700)]]} /></Guard>} />
      <Route path="/exams" element={<Guard><Page title="Exam pins" rows={[['Body', 'Price'], ['WAEC', naira(3500)], ['JAMB', naira(7700)]]} /></Guard>} />
      <Route path="/cashback" element={<Guard><Page title="Cashback" rows={[['Rule', 'Rate'], ['Airtime weekend', '2%']]} /></Guard>} />
      <Route path="/referrals" element={<Guard><Page title="Referrals" rows={[['Code', 'Signups', 'Paid'], ['MADO-CHINEDU', '12', naira(12500)]]} /></Guard>} />
      <Route path="/tickets" element={<Guard><Page title="Support tickets" rows={[['ID', 'Subject', 'Status'], ['T-1042', 'Failed IKEDC token', 'Open']]} /></Guard>} />
      <Route path="/reports" element={<Guard><Dashboard /></Guard>} />
      <Route path="/revenue" element={<Guard><Page title="Revenue" rows={[['Period', 'Revenue', 'Profit'], ['Today', naira(1240500), naira(188000)], ['This week', naira(8112000), naira(980000)], ['This month', naira(31440200), naira(4812000)]]} /></Guard>} />
      <Route path="/settings" element={<Guard><Page title="Settings" rows={[['Key', 'Value'], ['Maintenance', 'Off'], ['Max airtime', naira(50000)]]} /></Guard>} />
    </Routes>
  );
}
