import { format, addDays, isSameDay } from 'date-fns';
import { uk } from 'date-fns/locale';
import { QrCode, User, Calendar, Bell, CreditCard, Dumbbell, Clock, ChevronRight, Users, MapPin, Check, Heart, Star, ArrowLeft, Search, Settings, History, Repeat, LogOut } from 'lucide-react';
import QRCode from 'react-qr-code';
import { useState, useEffect } from 'react';

// --- Data & Helpers ---
type SessionType = 'group' | 'personal' | 'semi-personal';

const SCHEDULE = [
  { id: 1, title: 'Йога Вранці', type: 'group' as SessionType, startTime: '08:00', endTime: '09:00', trainer: 'Олена М.', location: 'Зал 2', capacity: 15, booked: 12, isUserBooked: false },
  { id: 2, title: 'Персональне тренування', type: 'personal' as SessionType, startTime: '09:30', endTime: '10:30', trainer: 'Іван К.', location: 'Тренажерний зал', capacity: 1, booked: 0, isUserBooked: false },
  { id: 3, title: 'Спліт-тренування', type: 'semi-personal' as SessionType, startTime: '11:00', endTime: '12:00', trainer: 'Анна С.', location: 'Зал 1', capacity: 2, booked: 1, isUserBooked: true },
  { id: 4, title: 'Кросфіт', type: 'group' as SessionType, startTime: '18:00', endTime: '19:00', trainer: 'Іван К.', location: 'Кросфіт зона', capacity: 12, booked: 12, isUserBooked: false },
  { id: 5, title: 'Пілатес', type: 'group' as SessionType, startTime: '19:00', endTime: '20:00', trainer: 'Олена М.', location: 'Зал 2', capacity: 10, booked: 5, isUserBooked: false },
  { id: 6, title: 'Персональне тренування', type: 'personal' as SessionType, startTime: '20:00', endTime: '21:00', trainer: 'Максим В.', location: 'Тренажерний зал', capacity: 1, booked: 1, isUserBooked: true },
];

const getTypeStyles = (type: SessionType) => {
  switch(type) {
    case 'group': return 'bg-blue-100/80 text-blue-700 border-blue-200';
    case 'personal': return 'bg-emerald-100/80 text-emerald-700 border-emerald-200';
    case 'semi-personal': return 'bg-amber-100/80 text-amber-700 border-amber-200';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const getTypeName = (type: SessionType) => {
  switch(type) {
    case 'group': return 'Групове';
    case 'personal': return 'Персональне';
    case 'semi-personal': return 'Спліт';
    default: return type;
  }
};

const TRAINERS = [
  {
    id: 1,
    name: 'Іван Коваленко',
    specialization: 'Кросфіт, Силові тренування',
    rating: 4.9,
    reviews: 128,
    image: 'https://picsum.photos/seed/trainer1/200/200',
    services: [
      { id: 101, name: 'Персональне тренування', duration: '60 хв', price: '800 ₴', type: 'personal' },
      { id: 102, name: 'Спліт-тренування (для двох)', duration: '60 хв', price: '1200 ₴', type: 'semi-personal' }
    ]
  },
  {
    id: 2,
    name: 'Олена Мельник',
    specialization: 'Йога, Пілатес, Стретчинг',
    rating: 5.0,
    reviews: 94,
    image: 'https://picsum.photos/seed/trainer2/200/200',
    services: [
      { id: 201, name: 'Індивідуальна йога', duration: '90 хв', price: '900 ₴', type: 'personal' },
      { id: 202, name: 'Парна йога', duration: '90 хв', price: '1300 ₴', type: 'semi-personal' }
    ]
  },
  {
    id: 3,
    name: 'Анна Сидоренко',
    specialization: 'Функціональний тренінг, TRX',
    rating: 4.8,
    reviews: 215,
    image: 'https://picsum.photos/seed/trainer3/200/200',
    services: [
      { id: 301, name: 'Персональне тренування', duration: '60 хв', price: '750 ₴', type: 'personal' },
      { id: 302, name: 'Спліт-тренування', duration: '60 хв', price: '1100 ₴', type: 'semi-personal' }
    ]
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('schedule');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filter, setFilter] = useState('all');
  
  const [favoriteTrainers, setFavoriteTrainers] = useState<number[]>([2]);
  const [selectedTrainerId, setSelectedTrainerId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [bookingService, setBookingService] = useState<{ trainerId: number, serviceId: number } | null>(null);
  const [bookingDate, setBookingDate] = useState<Date>(new Date());
  const [bookingTime, setBookingTime] = useState<string | null>(null);

  const toggleFavorite = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setFavoriteTrainers(prev => 
      prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const qrValue = "USER_ID_123456789_SECURE_TOKEN_ABCDEF";
  const dates = Array.from({ length: 14 }).map((_, i) => addDays(new Date(), i));
  const filteredSchedule = SCHEDULE.filter(s => {
    const matchesFilter = filter === 'all' || s.type === filter;
    const isVisible = s.type === 'group' || s.isUserBooked;
    return matchesFilter && isVisible;
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5] font-sans selection:bg-[#077CEF]/20">
      {/* Mobile Container */}
      <div className="w-full max-w-md h-[100dvh] sm:h-[850px] sm:rounded-[2.5rem] sm:shadow-2xl sm:shadow-[#077CEF]/10 bg-[#F0F2F5] relative overflow-hidden flex flex-col">
        
        {/* Top Decorative Blur */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-[#077CEF] rounded-full mix-blend-multiply filter blur-[100px] opacity-30 pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-72 h-72 bg-[#077CEF] rounded-full mix-blend-multiply filter blur-[100px] opacity-10 pointer-events-none" />

        {/* Header */}
        {activeTab === 'scan' && (
          <header className="px-6 pt-12 pb-4 flex items-center justify-between relative z-10 shrink-0">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img 
                  src="https://picsum.photos/seed/avatar123/100/100" 
                  alt="Профіль користувача" 
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
              </div>
              <div>
                <p className="text-sm font-medium text-[oklch(0.17_0.02_162.48)]/70">Добрий ранок,</p>
                <h1 className="text-xl font-bold text-[oklch(0.028_0.02_261.692)]">Олексій</h1>
              </div>
            </div>
            <button className="w-10 h-10 rounded-full bg-white/50 backdrop-blur-md border border-white/60 shadow-sm flex items-center justify-center text-[oklch(0.028_0.02_261.692)] hover:bg-white/80 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
          </header>
        )}

        {/* Main Content Area */}
        {activeTab === 'scan' && (
          <main className="flex-1 overflow-y-auto px-6 pb-8 flex flex-col relative z-10 hide-scrollbar">
            {/* QR Card Container */}
            <div className="w-full max-w-[320px] mx-auto mb-8 mt-2">
              <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex flex-col items-center border border-white/60">
                <div className="bg-white p-4 rounded-3xl shadow-sm mb-6">
                  <QRCode value={qrValue} size={180} level="H" fgColor="oklch(0.028 0.02 261.692)" bgColor="#FFFFFF" />
                </div>
                <div className="text-center">
                  <p className="text-[oklch(0.17_0.02_162.48)]/70 text-sm font-medium mb-1 capitalize">
                    {format(currentTime, 'EEEE, d MMMM', { locale: uk })}
                  </p>
                  <p className="text-3xl font-bold text-[oklch(0.028_0.02_261.692)] tracking-tight font-mono">
                    {format(currentTime, 'HH:mm:ss')}
                  </p>
                </div>
              </div>
            </div>

            {/* Abonement Section */}
            <div className="mb-8">
              <h2 className="text-sm font-bold text-[oklch(0.028_0.02_261.692)] mb-3 px-1">Мій абонемент</h2>
              <div className="bg-white/50 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-white/60 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#077CEF] shadow-sm shrink-0">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[oklch(0.028_0.02_261.692)] mb-1">Premium Безліміт</h3>
                    <p className="text-xs text-[oklch(0.17_0.02_162.48)]/70">Дійсний до 15.10.2026</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-[#077CEF]/10 text-[#077CEF] px-2 py-1 rounded-md">Активний</span>
              </div>
            </div>
          </main>
        )}

        {activeTab === 'schedule' && (
          <main className="flex-1 overflow-y-auto px-0 pb-8 flex flex-col relative z-10 hide-scrollbar">
            
            {/* Date Strip */}
            <div className="flex overflow-x-auto hide-scrollbar px-6 gap-3 mb-6 pb-2 pt-2 shrink-0">
              {dates.map(date => {
                const isSelected = isSameDay(date, selectedDate);
                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    className={`flex flex-col items-center justify-center min-w-[60px] h-[72px] rounded-2xl border transition-all shrink-0 ${
                      isSelected 
                        ? 'bg-[#077CEF] text-white border-[#077CEF] shadow-md shadow-[#077CEF]/20' 
                        : 'bg-white/50 backdrop-blur-md border-white/60 text-[oklch(0.17_0.02_162.48)] hover:bg-white/80'
                    }`}
                  >
                    <span className={`text-xs font-medium mb-1 capitalize ${isSelected ? 'text-white/80' : 'text-[oklch(0.17_0.02_162.48)]/60'}`}>
                      {format(date, 'E', { locale: uk })}
                    </span>
                    <span className="text-lg font-bold">
                      {format(date, 'd')}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Filters */}
            <div className="flex overflow-x-auto hide-scrollbar px-6 gap-2 mb-6 pb-1 shrink-0">
              {['all', 'group', 'personal', 'semi-personal'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border shrink-0 ${
                    filter === f
                      ? 'bg-white text-[#077CEF] border-white shadow-sm'
                      : 'bg-white/30 backdrop-blur-md border-white/40 text-[oklch(0.17_0.02_162.48)]/70 hover:bg-white/50'
                  }`}
                >
                  {f === 'all' ? 'Всі заняття' : getTypeName(f as SessionType)}
                </button>
              ))}
            </div>

            {/* Sessions List */}
            <div className="px-6 flex flex-col gap-4 shrink-0">
              {filteredSchedule.map(session => {
                const isFull = session.booked >= session.capacity;
                const availableSpots = session.capacity - session.booked;

                return (
                  <div key={session.id} className="bg-white/50 backdrop-blur-md rounded-[1.5rem] p-4 shadow-sm border border-white/60 flex gap-4 transition-all hover:bg-white/70 active:scale-[0.98] cursor-pointer">
                    {/* Time Column */}
                    <div className="flex flex-col items-center min-w-[50px] pt-1">
                      <span className="text-lg font-bold text-[oklch(0.028_0.02_261.692)]">{session.startTime}</span>
                      <span className="text-xs font-medium text-[oklch(0.17_0.02_162.48)]/50">{session.endTime}</span>
                    </div>

                    {/* Details Column */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getTypeStyles(session.type)}`}>
                          {getTypeName(session.type)}
                        </span>
                        {/* Capacity indicator */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isFull ? 'bg-red-100/80 text-red-700 border border-red-200' : 'bg-green-100/80 text-green-700 border border-green-200'}`}>
                          {isFull ? 'Місць немає' : `${availableSpots} вільн.`}
                        </span>
                      </div>
                      
                      <h3 className="text-base font-bold text-[oklch(0.028_0.02_261.692)] mb-2 leading-tight">{session.title}</h3>
                      
                      <div className="flex flex-col gap-1.5 mb-4">
                        <div className="flex items-center gap-2 text-xs text-[oklch(0.17_0.02_162.48)]/80">
                          <User className="w-3.5 h-3.5 text-[#077CEF]" />
                          <span>{session.trainer}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[oklch(0.17_0.02_162.48)]/80">
                          <MapPin className="w-3.5 h-3.5 text-[#077CEF]" />
                          <span>{session.location}</span>
                        </div>
                      </div>

                      <button className={`w-full py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 ${
                        session.isUserBooked
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                          : isFull 
                            ? 'bg-white/60 text-gray-500 cursor-not-allowed border border-white/80' 
                            : 'bg-[#077CEF] text-white hover:bg-[#0666C5] shadow-md shadow-[#077CEF]/20'
                      }`}>
                        {session.isUserBooked && <Check className="w-4 h-4" />}
                        {session.isUserBooked ? 'Ви записані' : (isFull ? 'В лист очікування' : 'Записатись')}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </main>
        )}

        {activeTab === 'trainers' && (
          <main className="flex-1 overflow-y-auto px-6 pb-8 flex flex-col relative z-10 hide-scrollbar">
            {!selectedTrainerId ? (
              <>
                <div className="mb-6 shrink-0 mt-2">
                  <h2 className="text-2xl font-bold text-[oklch(0.028_0.02_261.692)] mb-4">Тренери</h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[oklch(0.17_0.02_162.48)]/50" />
                    <input 
                      type="text" 
                      placeholder="Пошук за ім'ям або напрямком..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/50 backdrop-blur-md border border-white/60 rounded-2xl py-3 pl-10 pr-4 text-sm outline-none focus:border-[#077CEF]/50 transition-colors placeholder:text-[oklch(0.17_0.02_162.48)]/50 text-[oklch(0.028_0.02_261.692)]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4 shrink-0">
                  {TRAINERS.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.specialization.toLowerCase().includes(searchQuery.toLowerCase())).map(trainer => (
                    <div 
                      key={trainer.id} 
                      onClick={() => setSelectedTrainerId(trainer.id)}
                      className="bg-white/50 backdrop-blur-md rounded-[1.5rem] p-4 shadow-sm border border-white/60 flex gap-4 cursor-pointer hover:bg-white/70 transition-all active:scale-[0.98]"
                    >
                      <div className="relative shrink-0">
                        <img src={trainer.image} alt={trainer.name} className="w-20 h-20 rounded-2xl object-cover" referrerPolicy="no-referrer" />
                        <button 
                          onClick={(e) => toggleFavorite(e, trainer.id)}
                          className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md border border-white shadow-sm flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                        >
                          <Heart className={`w-4 h-4 ${favoriteTrainers.includes(trainer.id) ? 'fill-red-500 text-red-500' : 'text-[oklch(0.17_0.02_162.48)]/40'}`} />
                        </button>
                      </div>
                      <div className="flex-1 py-1">
                        <h3 className="text-base font-bold text-[oklch(0.028_0.02_261.692)] mb-1 leading-tight">{trainer.name}</h3>
                        <p className="text-xs text-[oklch(0.17_0.02_162.48)]/70 line-clamp-1">{trainer.specialization}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col shrink-0 mt-2">
                {(() => {
                  const trainer = TRAINERS.find(t => t.id === selectedTrainerId)!;
                  return (
                    <>
                      <button 
                        onClick={() => setSelectedTrainerId(null)}
                        className="w-10 h-10 mb-4 rounded-full bg-white/50 backdrop-blur-md border border-white/60 shadow-sm flex items-center justify-center text-[oklch(0.028_0.02_261.692)] hover:bg-white/80 transition-colors"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>

                      <div className="bg-white/40 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm border border-white/60 flex flex-col items-center text-center mb-6">
                        <div className="relative mb-4">
                          <img src={trainer.image} alt={trainer.name} className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md" referrerPolicy="no-referrer" />
                          <button 
                            onClick={(e) => toggleFavorite(e, trainer.id)}
                            className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-white border-2 border-[#F0F2F5] shadow-sm flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                          >
                            <Heart className={`w-5 h-5 ${favoriteTrainers.includes(trainer.id) ? 'fill-red-500 text-red-500' : 'text-[oklch(0.17_0.02_162.48)]/40'}`} />
                          </button>
                        </div>
                        <h2 className="text-xl font-bold text-[oklch(0.028_0.02_261.692)] mb-1">{trainer.name}</h2>
                        <p className="text-sm text-[oklch(0.17_0.02_162.48)]/70">{trainer.specialization}</p>
                      </div>

                      <h3 className="text-lg font-bold text-[oklch(0.028_0.02_261.692)] mb-4 px-1">Послуги та запис</h3>
                      <div className="flex flex-col gap-3">
                        {trainer.services.map(service => (
                          <div key={service.id} className="bg-white/50 backdrop-blur-md rounded-[1.5rem] p-4 shadow-sm border border-white/60 flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border mb-2 ${getTypeStyles(service.type as SessionType)}`}>
                                  {getTypeName(service.type as SessionType)}
                                </span>
                                <h4 className="text-sm font-bold text-[oklch(0.028_0.02_261.692)]">{service.name}</h4>
                                <p className="text-xs text-[oklch(0.17_0.02_162.48)]/70 mt-1 flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {service.duration}
                                </p>
                              </div>
                              <span className="text-base font-bold text-[#077CEF]">{service.price}</span>
                            </div>
                            <button 
                              onClick={() => {
                                setBookingService({ trainerId: trainer.id, serviceId: service.id });
                                setBookingDate(new Date());
                                setBookingTime(null);
                              }}
                              className="w-full py-2.5 rounded-xl text-sm font-bold bg-[#077CEF] text-white hover:bg-[#0666C5] shadow-md shadow-[#077CEF]/20 transition-colors"
                            >
                              Записатись
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </main>
        )}

        {activeTab === 'profile' && (
          <main className="flex-1 overflow-y-auto px-6 pb-8 flex flex-col relative z-10 hide-scrollbar pt-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8 shrink-0">
              <div className="relative">
                <img src="https://picsum.photos/seed/user1/200/200" alt="User" className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md" referrerPolicy="no-referrer" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[oklch(0.028_0.02_261.692)] leading-tight mb-1">Олександр П.</h2>
                <p className="text-sm text-[oklch(0.17_0.02_162.48)]/70 mb-2">+380 50 123 45 67</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-3 mb-8 shrink-0">
              <div className="flex-1 bg-white/50 backdrop-blur-md rounded-[1.5rem] p-4 shadow-sm border border-white/60 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-[#077CEF] mb-1">12</span>
                <span className="text-[10px] font-bold text-[oklch(0.17_0.02_162.48)]/60 uppercase tracking-wider text-center">Тренувань<br/>цього місяця</span>
              </div>
              <div className="flex-1 bg-white/50 backdrop-blur-md rounded-[1.5rem] p-4 shadow-sm border border-white/60 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-[#077CEF] mb-1">3</span>
                <span className="text-[10px] font-bold text-[oklch(0.17_0.02_162.48)]/60 uppercase tracking-wider text-center">Активні<br/>записи</span>
              </div>
            </div>

            {/* Quick Actions / Book Again */}
            <div className="mb-8 shrink-0">
              <h3 className="text-lg font-bold text-[oklch(0.028_0.02_261.692)] mb-4 px-1">Повторити запис</h3>
              <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 -mx-6 px-6">
                {[
                  { id: 1, trainer: 'Іван К.', type: 'Кросфіт', image: 'https://picsum.photos/seed/trainer1/100/100' },
                  { id: 2, trainer: 'Анна С.', type: 'Спліт', image: 'https://picsum.photos/seed/trainer3/100/100' },
                  { id: 3, trainer: 'Олена М.', type: 'Йога', image: 'https://picsum.photos/seed/trainer2/100/100' },
                ].map(item => (
                  <div key={item.id} className="min-w-[140px] bg-white/50 backdrop-blur-md rounded-[1.5rem] p-3 shadow-sm border border-white/60 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <img src={item.image} alt={item.trainer} className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                      <span className="text-xs font-bold text-[oklch(0.028_0.02_261.692)]">{item.trainer}</span>
                    </div>
                    <p className="text-sm font-bold text-[oklch(0.17_0.02_162.48)]/80">{item.type}</p>
                    <button 
                      onClick={() => {
                        setBookingService({ trainerId: item.id, serviceId: 101 });
                        setBookingDate(new Date());
                        setBookingTime(null);
                      }}
                      className="mt-1 w-full py-2 bg-[#077CEF]/10 text-[#077CEF] hover:bg-[#077CEF]/20 transition-colors text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <Repeat className="w-3.5 h-3.5" /> Повторити
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Menu */}
            <div className="flex flex-col gap-2 shrink-0">
              <h3 className="text-lg font-bold text-[oklch(0.028_0.02_261.692)] mb-2 px-1">Акаунт</h3>
              
              <button className="w-full bg-white/50 backdrop-blur-md rounded-[1.5rem] p-4 shadow-sm border border-white/60 flex items-center justify-between hover:bg-white/70 transition-colors active:scale-[0.98]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#077CEF]/10 flex items-center justify-center text-[#077CEF]">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-[oklch(0.028_0.02_261.692)]">Мої записи</span>
                </div>
                <ChevronRight className="w-5 h-5 text-[oklch(0.17_0.02_162.48)]/40" />
              </button>

              <button className="w-full bg-white/50 backdrop-blur-md rounded-[1.5rem] p-4 shadow-sm border border-white/60 flex items-center justify-between hover:bg-white/70 transition-colors active:scale-[0.98]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#077CEF]/10 flex items-center justify-center text-[#077CEF]">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-[oklch(0.028_0.02_261.692)]">Оплата та абонемент</span>
                </div>
                <ChevronRight className="w-5 h-5 text-[oklch(0.17_0.02_162.48)]/40" />
              </button>

              <button className="w-full bg-white/50 backdrop-blur-md rounded-[1.5rem] p-4 shadow-sm border border-white/60 flex items-center justify-between hover:bg-white/70 transition-colors active:scale-[0.98]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#077CEF]/10 flex items-center justify-center text-[#077CEF]">
                    <History className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-[oklch(0.028_0.02_261.692)]">Історія тренувань</span>
                </div>
                <ChevronRight className="w-5 h-5 text-[oklch(0.17_0.02_162.48)]/40" />
              </button>

              <button className="w-full bg-white/50 backdrop-blur-md rounded-[1.5rem] p-4 shadow-sm border border-white/60 flex items-center justify-between hover:bg-white/70 transition-colors active:scale-[0.98]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#077CEF]/10 flex items-center justify-center text-[#077CEF]">
                    <Settings className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-[oklch(0.028_0.02_261.692)]">Налаштування</span>
                </div>
                <ChevronRight className="w-5 h-5 text-[oklch(0.17_0.02_162.48)]/40" />
              </button>

              <button className="w-full mt-4 bg-red-500/10 backdrop-blur-md rounded-[1.5rem] p-4 shadow-sm border border-red-500/20 flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors active:scale-[0.98] text-red-600">
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-bold">Вийти з акаунту</span>
              </button>
            </div>
          </main>
        )}

        {/* Bottom Navigation */}
        <nav className="bg-white/80 backdrop-blur-xl border-t border-white/60 px-6 py-4 flex justify-around items-center relative z-10 shrink-0 sm:rounded-b-[2.5rem]">
          <button 
            onClick={() => setActiveTab('scan')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'scan' ? 'text-[#077CEF]' : 'text-[oklch(0.17_0.02_162.48)]/50 hover:text-[oklch(0.028_0.02_261.692)]'}`}
          >
            <QrCode className="w-6 h-6" />
            <span className="text-[10px] font-bold">Скан</span>
          </button>
          <button 
            onClick={() => setActiveTab('schedule')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'schedule' ? 'text-[#077CEF]' : 'text-[oklch(0.17_0.02_162.48)]/50 hover:text-[oklch(0.028_0.02_261.692)]'}`}
          >
            <Calendar className="w-6 h-6" />
            <span className="text-[10px] font-bold">Розклад</span>
          </button>
          <button 
            onClick={() => setActiveTab('trainers')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'trainers' ? 'text-[#077CEF]' : 'text-[oklch(0.17_0.02_162.48)]/50 hover:text-[oklch(0.028_0.02_261.692)]'}`}
          >
            <Users className="w-6 h-6" />
            <span className="text-[10px] font-bold">Тренери</span>
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'profile' ? 'text-[#077CEF]' : 'text-[oklch(0.17_0.02_162.48)]/50 hover:text-[oklch(0.028_0.02_261.692)]'}`}
          >
            <User className="w-6 h-6" />
            <span className="text-[10px] font-bold">Профіль</span>
          </button>
        </nav>

        {/* Booking Modal */}
        {bookingService && (
          <div className="absolute inset-0 z-50 bg-[#F0F2F5] flex flex-col sm:rounded-[2.5rem]">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-xl border-b border-white/60 px-6 py-4 flex items-center justify-between shrink-0">
              <button 
                onClick={() => setBookingService(null)}
                className="w-10 h-10 rounded-full bg-white/50 border border-white/60 flex items-center justify-center text-[oklch(0.028_0.02_261.692)] hover:bg-white/80 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-bold text-[oklch(0.028_0.02_261.692)]">Вибір часу</h2>
              <div className="w-10 h-10" /> {/* Spacer */}
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 py-6 hide-scrollbar">
              {/* Date Selection */}
              <h3 className="text-base font-bold text-[oklch(0.028_0.02_261.692)] mb-4">Оберіть дату</h3>
              <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 -mx-6 px-6 mb-8">
                {dates.map((date, i) => {
                  const isSelected = isSameDay(date, bookingDate);
                  return (
                    <button
                      key={i}
                      onClick={() => { setBookingDate(date); setBookingTime(null); }}
                      className={`flex flex-col items-center justify-center min-w-[64px] h-[84px] rounded-2xl border transition-all ${
                        isSelected 
                          ? 'bg-[#077CEF] border-[#077CEF] text-white shadow-md shadow-[#077CEF]/20' 
                          : 'bg-white/50 border-white/60 text-[oklch(0.17_0.02_162.48)]/70 hover:bg-white/80'
                      }`}
                    >
                      <span className={`text-xs font-medium mb-1 ${isSelected ? 'text-white/80' : ''}`}>
                        {format(date, 'EEE', { locale: uk })}
                      </span>
                      <span className={`text-xl font-bold ${isSelected ? 'text-white' : 'text-[oklch(0.028_0.02_261.692)]'}`}>
                        {format(date, 'd')}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Time Selection */}
              <h3 className="text-base font-bold text-[oklch(0.028_0.02_261.692)] mb-4">Оберіть час</h3>
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[
                  { time: '09:00', available: true },
                  { time: '10:00', available: false },
                  { time: '11:00', available: true },
                  { time: '12:00', available: true },
                  { time: '14:00', available: false },
                  { time: '15:00', available: true },
                  { time: '16:00', available: true },
                  { time: '18:00', available: true },
                  { time: '19:00', available: false },
                ].map((slot, i) => {
                  const isSelected = bookingTime === slot.time;
                  return (
                    <button
                      key={i}
                      disabled={!slot.available}
                      onClick={() => setBookingTime(slot.time)}
                      className={`py-3 rounded-xl text-sm font-bold border transition-all ${
                        !slot.available 
                          ? 'bg-gray-100/50 border-gray-200/50 text-gray-400 cursor-not-allowed'
                          : isSelected
                            ? 'bg-[#077CEF] border-[#077CEF] text-white shadow-md shadow-[#077CEF]/20'
                            : 'bg-white/50 border-white/60 text-[oklch(0.028_0.02_261.692)] hover:bg-white/80 active:scale-95'
                      }`}
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Action */}
            <div className="bg-white/80 backdrop-blur-xl border-t border-white/60 px-6 py-4 shrink-0 sm:rounded-b-[2.5rem]">
              <button 
                disabled={!bookingTime}
                onClick={() => {
                  alert('Запис підтверджено!');
                  setBookingService(null);
                }}
                className={`w-full py-3.5 rounded-2xl text-base font-bold transition-all ${
                  bookingTime 
                    ? 'bg-[#077CEF] text-white shadow-lg shadow-[#077CEF]/20 hover:bg-[#0666C5] active:scale-[0.98]' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Підтвердити запис
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
