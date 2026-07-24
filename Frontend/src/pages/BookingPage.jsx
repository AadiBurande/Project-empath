// src/pages/BookingPage.jsx
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { fetchApi } from '../utils/api';

const BookingPage = () => {
  const [counsellors, setCounsellors] = useState([]);
  const [selectedCounsellor, setSelectedCounsellor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [mode, setMode] = useState('In-Person');
  const [notes, setNotes] = useState('');
  const [myAppointments, setMyAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('book');
  const [loading, setLoading] = useState(true);
  const [bookingMessage, setBookingMessage] = useState('');

  useEffect(() => {
    loadCounsellors();
    loadMyAppointments();
  }, []);

  useEffect(() => {
    if (selectedCounsellor) {
      loadSlots(selectedCounsellor._id, selectedDate);
    }
  }, [selectedCounsellor, selectedDate]);

  const loadCounsellors = async () => {
    try {
      const res = await fetchApi('/booking/counsellors');
      if (res.success) {
        setCounsellors(res.counsellors);
        if (res.counsellors.length > 0) {
          setSelectedCounsellor(res.counsellors[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching counsellors:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSlots = async (counsellorId, dateStr) => {
    try {
      const res = await fetchApi(`/booking/counsellors/${counsellorId}/slots?date=${dateStr}`);
      if (res.success) {
        setAvailableSlots(res.available_slots);
        setSelectedSlot(res.available_slots[0] || '');
      }
    } catch (err) {
      console.error('Error fetching slots:', err);
    }
  };

  const loadMyAppointments = async () => {
    try {
      const res = await fetchApi('/booking/appointments/mine');
      if (res.success) {
        setMyAppointments(res.appointments);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!selectedCounsellor || !selectedSlot) return;

    try {
      const res = await fetchApi('/booking/appointments', {
        method: 'POST',
        body: JSON.stringify({
          counsellor_id: selectedCounsellor._id,
          date: selectedDate,
          time_slot: selectedSlot,
          mode,
          notes
        })
      });

      if (res.success) {
        setBookingMessage('✅ Appointment booked confidentially!');
        loadMyAppointments();
        loadSlots(selectedCounsellor._id, selectedDate);
        setNotes('');
        setTimeout(() => setBookingMessage(''), 4000);
      }
    } catch (err) {
      alert(err.message || 'Failed to book appointment');
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this confidential appointment?')) return;
    try {
      const res = await fetchApi(`/booking/appointments/${id}/cancel`, { method: 'PATCH' });
      if (res.success) {
        loadMyAppointments();
        if (selectedCounsellor) loadSlots(selectedCounsellor._id, selectedDate);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <div className="flex-grow flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Confidential Counsellor Booking</h1>
              <p className="text-xs text-slate-500 mt-1">Book private 1-on-1 sessions directly with on-campus psychological professionals.</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('book')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'book'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                📅 Schedule Session
              </button>
              <button
                onClick={() => setActiveTab('my_appointments')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'my_appointments'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                📋 My Appointments ({myAppointments.length})
              </button>
            </div>
          </div>

          {bookingMessage && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold rounded-2xl">
              {bookingMessage}
            </div>
          )}

          {activeTab === 'book' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Select Campus Counsellor</h3>
                {counsellors.map((c) => (
                  <div
                    key={c._id}
                    onClick={() => setSelectedCounsellor(c)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedCounsellor?._id === c._id
                        ? 'border-purple-600 bg-purple-50/50 shadow-md ring-2 ring-purple-600/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex gap-4">
                      <img
                        src={c.avatar_url}
                        alt={c.name}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{c.name}</h4>
                        <p className="text-xs text-purple-700 font-medium">{c.title}</p>
                        <p className="text-[11px] text-slate-500 mt-1">{c.department}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedCounsellor && (
                <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Book Session with {selectedCounsellor.name}</h3>
                  <p className="text-xs text-slate-500 mb-6">📍 Location: {selectedCounsellor.location}</p>

                  <form onSubmit={handleBookAppointment} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Select Date
                        </label>
                        <input
                          type="date"
                          value={selectedDate}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Session Format
                        </label>
                        <select
                          value={mode}
                          onChange={(e) => setMode(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                        >
                          <option value="In-Person">In-Person (Campus Clinic)</option>
                          <option value="Online Video">Confidential Video Session</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Available Time Slots
                      </label>
                      {availableSlots.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {availableSlots.map((slot) => (
                            <button
                              type="button"
                              key={slot}
                              onClick={() => setSelectedSlot(slot)}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                selectedSlot === slot
                                  ? 'bg-purple-600 text-white shadow-md'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl">
                          No open slots available for this date. Please pick another date.
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Private Notes for Counsellor (Optional)
                      </label>
                      <textarea
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Briefly describe what you'd like to talk about..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!selectedSlot}
                      className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl shadow-md transition-all disabled:opacity-50"
                    >
                      Confirm Confidential Booking 🔒
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 max-w-3xl">
              {myAppointments.length > 0 ? (
                myAppointments.map((appt) => (
                  <div key={appt._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          appt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {appt.status}
                        </span>
                        <span className="text-xs font-semibold text-purple-700">{appt.mode}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-base">{appt.counsellor_name}</h4>
                      <p className="text-xs text-slate-500">📅 {appt.date} at {appt.time_slot}</p>
                      <p className="text-xs text-slate-500">📍 {appt.location}</p>
                    </div>

                    {appt.status === 'confirmed' && (
                      <button
                        onClick={() => handleCancel(appt._id)}
                        className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl transition-all"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                  <p className="text-slate-500 text-sm">You haven't scheduled any counsellor sessions yet.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default BookingPage;
