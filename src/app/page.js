'use client';
import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';

//login library
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  signInWithCustomToken 
} 
  from 'firebase/auth';

//query for reading
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp, 
  doc, 
  setDoc, 
  deleteDoc 
} 
  from 'firebase/firestore';

//icon import  
import { 
  BookOpen, 
  Aperture,
  Orbit,
  Sparkles,
  FileHeart,
  Clock, 
  StickyNote, 
  Send, 
  CheckCircle, 
  Users, 
  Play, 
  Pause, 
  RefreshCw, 
  Trash2, 
  Copy, 
  Trophy,
  Download 
} 
from 'lucide-react';

// CONFIG FIREBASE 
const firebaseConfig = {
  apiKey: "AIzaSyAhJ4QMrRC1wYu9TMm5sF1n3Gud12ZyEgc",
  authDomain: "ram2026-project.firebaseapp.com",
  projectId: "ram2026-project",
  storageBucket: "ram2026-project.firebasestorage.app",
  messagingSenderId: "1083942705016",
  appId: "1:1083942705016:web:23e2803c513e7fad9c1a8d"
};

// Cek sederhana agar tidak crash total saat config kosong
const app = firebaseConfig.apiKey ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const appId = "ram-app-live-v1";



// App Component

const AuthScreen = ({ onJoin }) => {
  const [name, setName] = useState('');
  const [group, setGroup] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !group.trim()) return;
    setLoading(true);
    setTimeout(() => { onJoin(name, group.toLowerCase().replace(/\s/g, '-')); setLoading(false); }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#06392f] p-4 font-sans text-[#E8F1F0]">
      <div className="w-full max-w-md bg-[#094d40] p-8 rounded-2xl shadow-2xl border border-[#E4D5B7]/30">
        <div className="text-center mb-8">
          
          {/* --- LOGO GAMBAR SENDIRI (LOGIN) --- */}
          <div className="w-24 h-24 bg-[#E4D5B7] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#E4D5B7]/20 overflow-hidden p-1">
             {/* Menggunakan icon-192.png yang ada di folder public */}
             <img 
               src="/icon.png" 
               alt="RAM - Ramadhan Social" 
               className="w-full h-full object-cover rounded-xl" 
             />
          </div>
          {/* ----------------------------------- */}

          <h1 className="text-3xl font-bold text-[#E4D5B7] mb-2">RAM</h1>
          <p className="text-[#E8F1F0]/70">Connect, Read, and Reflect together</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#E4D5B7] mb-1">Your Name</label>
            <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full px-4 py-3 rounded-xl bg-[#06392f] border border-[#E4D5B7]/30 text-[#E8F1F0] focus:outline-none focus:border-[#E4D5B7]" 
                placeholder="e.g. Sarah" 
                required 
                onInvalid={e => e.target.setCustomValidity('Please fill your name!')}
                onInput={e => e.target.setCustomValidity('')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#E4D5B7] mb-1">Your Group Name</label>
            <input 
                type="text" 
                value={group} 
                onChange={(e) => setGroup(e.target.value)} 
                className="w-full px-4 py-3 rounded-xl bg-[#06392f] border border-[#E4D5B7]/30 text-[#E8F1F0] focus:outline-none focus:border-[#E4D5B7]" 
                placeholder="e.g. Family-Goals-2025" 
                required 
                onInvalid={e => e.target.setCustomValidity('Hey! Your group name please!')}
                onInput={e => e.target.setCustomValidity('')}
            />
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 bg-[#E4D5B7] hover:bg-[#d0c1a0] text-[#06392f] font-bold rounded-xl shadow-lg disabled:opacity-50 transition-transform active:scale-95">
            {loading ? 'Joining...' : 'Start Journey'}
          </button>
        </form>
      </div>
    </div>
  );
};

const MemoWall = ({ user, groupName }) => {
  const [memos, setMemos] = useState([]);
  const [newMemo, setNewMemo] = useState('');
  const [groupPerfection, setGroupPerfection] = useState(0); 
  
  useEffect(() => {
    if (!user || !groupName || !db) return;
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', `memos-${groupName}`), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const now = Date.now();
      setMemos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(memo => {
         const memoTime = memo.createdAt?.toMillis ? memo.createdAt.toMillis() : Date.now();
         return (now - memoTime) < 86400000;
      }));
    });
  }, [user, groupName]);

  useEffect(() => {
    if (!user || !groupName || !db) return;
    return onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', `tadarus-${groupName}`)), (snapshot) => {
      const memberSet = new Set();
      const juzData = [];
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.completedBy) data.completedBy.forEach(p => memberSet.add(p.uid));
        juzData.push(data);
      });
      let gold = 0;
      if (memberSet.size > 0) juzData.forEach(d => { if (d.completedBy?.length >= memberSet.size) gold++; });
      setGroupPerfection(gold);
    });
  }, [user, groupName]);

  const postMemo = async (e) => {
    e.preventDefault(); if (!newMemo.trim() || !db) return;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', `memos-${groupName}`), { text: newMemo, author: user.displayName, uid: user.uid, createdAt: serverTimestamp() });
    setNewMemo('');
  };
  const deleteMemo = async (id) => { if(db) deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', `memos-${groupName}`, id)); }
  const pct = Math.round((groupPerfection / 30) * 100);

  return (
    <div className="pb-24 px-4 pt-6 max-w-4xl mx-auto">
      <div className="mb-6 bg-[#094d40]/50 rounded-2xl p-4 border border-[#E4D5B7]/20 flex items-center gap-4">
        <div className="bg-[#E4D5B7]/10 p-3 rounded-full text-[#E4D5B7]"><Trophy size={24} fill={pct === 100 ? "#E4D5B7" : "none"} /></div>
        <div className="flex-1">
          <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-1.5 text-[#E8F1F0]/60"><span>Group Perfection</span><span className="text-[#E4D5B7]">{groupPerfection} / 30 Gold</span></div>
          <div className="h-3 w-full bg-[#06392f] rounded-full overflow-hidden border border-[#E4D5B7]/10"><div className="h-full bg-gradient-to-r from-[#E4D5B7] to-[#f5d76e] transition-all duration-1000 ease-out" style={{ width: `${pct}%` }}></div></div>
        </div>
      </div>
      <div className="mb-8 bg-[#094d40] p-6 rounded-2xl border border-[#E4D5B7]/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#E4D5B7]/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <h2 className="text-2xl font-bold text-[#E8F1F0] mb-2">Social Memos</h2>
        <form onSubmit={postMemo} className="relative">
          <textarea value={newMemo} onChange={(e) => setNewMemo(e.target.value)} maxLength={140} placeholder="Share a dua..." className="w-full h-24 p-4 pr-12 rounded-xl bg-[#06392f] border border-[#E4D5B7]/30 text-[#E8F1F0] focus:outline-none focus:border-[#E4D5B7] resize-none" />
          <button type="submit" disabled={!newMemo.trim()} className="absolute bottom-3 right-3 p-2 bg-[#E4D5B7] text-[#06392f] rounded-lg disabled:opacity-50"><Send size={18} /></button>
        </form>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {memos.map(m => (
          <div key={m.id} className="aspect-square p-4 rounded-xl bg-[#E8F1F0] text-[#06392f] shadow-lg relative flex flex-col justify-between">
            <div className="font-medium text-sm overflow-y-auto max-h-[70%]">"{m.text}"</div>
            <div><div className="h-[1px] w-full bg-[#06392f]/10 mb-2"></div><div className="flex justify-between items-end"><span className="text-xs font-bold text-[#06392f]/70">@{m.author}</span>{m.uid === user.uid && <button onClick={() => deleteMemo(m.id)} className="text-red-500"><Trash2 size={14}/></button>}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Pomodoro = ({ user, groupName }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  
  useEffect(() => { let i = null; if (isActive && timeLeft > 0) i = setInterval(() => setTimeLeft(t => t - 1), 1000); else if (timeLeft === 0) setIsActive(false); return () => clearInterval(i); }, [isActive, timeLeft]);
  useEffect(() => { if (!isActive || !db) return; const upd = () => setDoc(doc(db, 'artifacts', appId, 'public', 'data', `status-${groupName}`, user.uid), { name: user.displayName, isReading: isActive, lastSeen: serverTimestamp(), uid: user.uid }, { merge: true }); upd(); const i = setInterval(upd, 120000); return () => clearInterval(i); }, [isActive, user, groupName]);
  useEffect(() => { if(!db) return; return onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', `status-${groupName}`)), (s) => setActiveUsers(s.docs.map(d => d.data()).filter(u => u.isReading && u.uid !== user.uid))); }, [user, groupName]);

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  return (
    <div className="pb-24 px-4 pt-6 max-w-2xl mx-auto flex flex-col items-center">
      {activeUsers.length > 0 && <div className="w-full mb-6 bg-[#094d40]/50 border border-[#E4D5B7]/30 rounded-full px-6 py-3 flex items-center gap-3 animate-pulse"><span className="text-[#E4D5B7] text-sm font-medium">{activeUsers.length} friends reading now</span></div>}
      <div className="relative w-64 h-64 flex items-center justify-center mb-8">
        <div className={`absolute inset-0 rounded-full border-4 border-[#094d40] ${isActive ? 'animate-pulse' : ''}`}></div>
        <div className="text-center z-10"><div className="text-6xl font-bold text-[#E8F1F0] font-mono mb-2">{formatTime(timeLeft)}</div><div className="text-[#E4D5B7] text-sm tracking-widest uppercase">{isActive ? 'Focus' : 'Ready'}</div></div>
      </div>
      <div className="flex gap-4"><button onClick={() => setIsActive(!isActive)} className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold ${isActive ? 'bg-[#E8F1F0] text-[#06392f]' : 'bg-[#E4D5B7] text-[#06392f]'}`}>{isActive ? <><Pause size={20}/> Pause</> : <><Play size={20}/> Start</>}</button><button onClick={() => {setIsActive(false); setTimeLeft(25*60)}} className="p-3 rounded-full border border-[#E8F1F0]/20 text-[#E8F1F0]"><RefreshCw size={20}/></button></div>
    </div>
  );
};

const TadarusGroup = ({ user, groupName }) => {
  const [groupProgress, setGroupProgress] = useState({});
  const [personalCount, setPersonalCount] = useState(0);
  const [perfectionCount, setPerfectionCount] = useState(0);
  const [detectedMembers, setDetectedMembers] = useState(0);

  useEffect(() => {
    if(!db) return;
    return onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', `tadarus-${groupName}`)), (snapshot) => {
      const map = {}; const members = new Set(); let my = 0; let gold = 0; const docs = [];
      snapshot.docs.forEach(doc => {
        const d = doc.data(); map[doc.id] = d.completedBy || []; docs.push(d);
        if (d.completedBy) { d.completedBy.forEach(p => members.add(p.uid)); if (d.completedBy.some(p => p.uid === user.uid)) my++; }
      });
      if (members.size > 0) docs.forEach(d => { if (d.completedBy?.length >= members.size) gold++; });
      setGroupProgress(map); setDetectedMembers(members.size); setPersonalCount(my); setPerfectionCount(gold);
    });
  }, [user, groupName]);

  const toggleJuz = async (juzNum) => {
    if(!db) return;
    const docId = `juz-${juzNum}`; const curr = groupProgress[docId] || []; const isDone = curr.some(p => p.uid === user.uid);
    const next = isDone ? curr.filter(p => p.uid !== user.uid) : [...curr, { uid: user.uid, name: user.displayName }];
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', `tadarus-${groupName}`, docId), { completedBy: next }, { merge: true });
  };

  const pPct = Math.round((personalCount / 30) * 100); const goldPct = Math.round((perfectionCount / 30) * 100);
  return (
    <div className="pb-24 px-4 pt-6 max-w-4xl mx-auto">
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#094d40]/50 p-4 rounded-xl border border-[#E4D5B7]/20"><div className="flex justify-between mb-2"><span className="text-xs font-bold text-[#E8F1F0]/70 uppercase">My Progress</span><span className="text-sm font-bold text-[#E8F1F0]">{personalCount}/30</span></div><div className="h-2 w-full bg-[#06392f] rounded-full overflow-hidden"><div className="h-full bg-[#E8F1F0]" style={{ width: `${pPct}%`, transition: 'width 0.5s' }}></div></div></div>
        <div className="bg-[#E4D5B7]/10 p-4 rounded-xl border border-[#E4D5B7]/30"><div className="flex justify-between mb-2"><span className="text-xs font-bold text-[#E4D5B7] uppercase flex gap-1"><Trophy size={12}/> Perfection</span><span className="text-sm font-bold text-[#E4D5B7]">{perfectionCount}/30</span></div><div className="h-2 w-full bg-[#06392f] rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#E4D5B7] to-[#f5d76e]" style={{ width: `${goldPct}%`, transition: 'width 0.5s' }}></div></div><div className="text-[10px] text-[#E4D5B7]/60 mt-2 text-right">{detectedMembers} active members</div></div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({length:30},(_,i)=>i+1).map(num => {
           const completions = groupProgress[`juz-${num}`] || []; const my = completions.some(p => p.uid === user.uid);
           const isGold = detectedMembers > 0 && completions.length >= detectedMembers;
           return (
             <div key={num} onClick={() => toggleJuz(num)} className={`relative p-4 rounded-xl border-2 cursor-pointer min-h-[140px] flex flex-col justify-between ${isGold ? 'bg-[#08332a] border-[#E4D5B7] text-[#E4D5B7] shadow-[0_0_15px_rgba(212,175,55,0.25)]' : my ? 'bg-[#094d40] border-[#E8F1F0]/50 text-[#E8F1F0]' : 'bg-[#06392f] border-[#E8F1F0]/10 text-[#E8F1F0]/50'}`}>
               <div className="flex justify-between"><span className="text-lg font-bold">Juz {num}</span>{isGold ? <Trophy size={18}/> : my ? <CheckCircle size={18}/> : null}</div>
               <div className="mt-4 flex flex-col gap-1 overflow-y-auto max-h-[60px] scrollbar-hide">{completions.map((p,i)=><div key={i} className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-[#E4D5B7]"></div><span className={`text-[10px] truncate ${p.uid===user.uid?'text-[#E4D5B7]':''}`}>{p.uid===user.uid?'Me':p.name.split(' ')[0]}</span></div>)}</div>
             </div>
           )
        })}
      </div>
    </div>
  );
};

export default function RamadanApp() {
  const [user, setUser] = useState(null); const [gn, setGn] = useState(null); const [tab, setTab] = useState('memos'); const [cp, setCp] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null); // STATE UNTUK PWA

  // --- EFFECT: DETEKSI INSTALLABLE PWA ---
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault(); // Mencegah browser menampilkan pop-up default yg membingungkan
      setInstallPrompt(e); // Simpan event-nya buat dipanggil nanti
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // --- FUNGSI KLIK TOMBOL INSTALL ---
  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
        setInstallPrompt(null); // Hilangkan tombol kalau user setuju
    }
  };

  useEffect(() => { if(auth) onAuthStateChanged(auth, u => { if (!u) signInAnonymously(auth).catch(e=>console.log('No DB yet')); }); }, []);
  const join = (n, g) => { 
    // Jika DB belum ada, kita kasih user "Palsu" dulu biar tampilan jalan
    if(auth?.currentUser){ setUser({uid:auth.currentUser.uid, displayName:n}); setGn(g); }
    else { setUser({uid:'guest-123', displayName:n}); setGn(g); alert("Mode Preview (Belum ada Database)"); }
  };
  const copy = () => { if(gn){ navigator.clipboard.writeText(gn); setCp(true); setTimeout(()=>setCp(false),2000); }};
  
  if (!user) return <AuthScreen onJoin={join} />;
  return (
    <div className="min-h-screen bg-[#06392f] text-[#E8F1F0] font-sans selection:bg-[#E4D5B7] selection:text-[#06392f]">
      <header className="fixed top-0 w-full z-50 bg-[#06392f]/90 backdrop-blur-md border-b border-[#E8F1F0]/5 px-4 py-4 grid grid-cols-3 items-center">
        <div className="flex items-center gap-2"><FileHeart className="text-[#E4D5B7]" size={24}/><h1 className="font-bold hidden sm:block">RAM</h1></div>
        <div className="flex flex-col items-center"><span className="text-[9px] text-[#E8F1F0]/40 uppercase tracking-widest mb-0.5">GROUP</span><button onClick={copy} className="flex items-center gap-1.5 bg-[#E8F1F0]/5 px-3 py-1.5 rounded-full border border-[#E4D5B7]/20 hover:bg-[#E4D5B7]/10 active:scale-95"><span className="text-xs font-bold text-[#E4D5B7] max-w-[100px] truncate">{gn}</span>{cp?<CheckCircle size={12} className="text-green-400"/>:<Copy size={12} className="text-[#E8F1F0]/60"/>}</button></div>
        {/* Profile & Install Button */}
        <div className="flex items-center gap-2 justify-end">
            
            {/* --- TAMBAHAN 3: Tombol Install UI --- */}
            {installPrompt && (
                <button 
                    onClick={handleInstallClick} 
                    className="w-8 h-8 rounded-full bg-[#E4D5B7] flex items-center justify-center text-[#06392f] animate-bounce shadow-lg"
                    title="Install App"
                >
                    <Download size={16} strokeWidth={3} />
                </button>
            )}
            {/* ------------------------------------- */}

            <div className="text-right hidden sm:block"><div className="text-xs text-[#E8F1F0]/50">Signed in as</div><div className="text-sm font-medium text-[#E4D5B7]">{user.displayName}</div></div>
            <div className="w-8 h-8 rounded-full bg-[#E8F1F0]/10 flex items-center justify-center border border-[#D4AF37]/30 text-[#E4D5B7] font-bold text-sm">{user.displayName.charAt(0)}</div>
        </div>
      </header>
      <main className="pt-20 min-h-screen">
        {tab==='memos'&&<MemoWall user={user} groupName={gn}/>}
        {tab==='pomodoro'&&<Pomodoro user={user} groupName={gn}/>}
        {tab==='tadarus'&&<TadarusGroup user={user} groupName={gn}/>}
      </main>
      <nav className="fixed bottom-0 w-full bg-[#094d40] border-t border-[#E8F1F0]/5 pb-safe pt-2 px-6 flex justify-between z-50 shadow-2xl">
        <button onClick={()=>setTab('memos')} className={`flex flex-col items-center p-3 rounded-xl ${tab==='memos'?'text-[#E4D5B7] -translate-y-2':'text-[#E8F1F0]/40'}`}><StickyNote size={24}/><span className="text-[10px] mt-1 font-medium">Memos</span></button>
        <button onClick={()=>setTab('pomodoro')} className={`flex flex-col items-center p-3 rounded-xl ${tab==='pomodoro'?'text-[#E4D5B7] -translate-y-2':'text-[#E8F1F0]/40'}`}><Clock size={24}/><span className="text-[10px] mt-1 font-medium">Focus</span></button>
        <button onClick={()=>setTab('tadarus')} className={`flex flex-col items-center p-3 rounded-xl ${tab==='tadarus'?'text-[#E4D5B7] -translate-y-2':'text-[#E8F1F0]/40'}`}><Users size={24}/><span className="text-[10px] mt-1 font-medium">Group</span></button>
      </nav>
    </div>
  );
};