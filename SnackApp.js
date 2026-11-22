// ============================================================
// RIDE AI — Single-file Expo Snack version
// Paste this entire file into snack.expo.dev as App.js
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, SafeAreaView,
  Animated, Alert, StatusBar,
} from 'react-native';

// ── Theme ──────────────────────────────────────────────────
const C = {
  bg: '#0f0f13', surface: '#1a1a24', surface2: '#22223a',
  border: '#2e2e45', text: '#f0f0f5', muted: '#8888aa',
  accent: '#6c63ff', accent2: '#ff6584',
  green: '#22c55e', yellow: '#f59e0b', red: '#ef4444',
};

// ── Voice AI (simulated) ───────────────────────────────────
function parseIntent(text) {
  const t = text.toLowerCase();
  if (t.includes('airport') || t.includes('terminal'))
    return { intent: 'DEST', destination: 'International Airport Terminal 2' };
  if (t.includes('mall') || t.includes('shopping'))
    return { intent: 'DEST', destination: 'Central Mall, MG Road' };
  if (t.includes('hospital'))
    return { intent: 'DEST', destination: 'City Hospital, Park Street' };
  if (t.includes('tech') || t.includes('office'))
    return { intent: 'DEST', destination: 'Tech Park, Electronic City' };
  if (t.includes('station') || t.includes('railway'))
    return { intent: 'DEST', destination: 'Railway Station, Platform 1' };
  if (t.includes('suv') || t.includes('bag') || t.includes('luggage'))
    return { intent: 'VEHICLE', vehicleId: 3 };
  if (t.includes('comfort') || t.includes('premium'))
    return { intent: 'VEHICLE', vehicleId: 2 };
  if (t.includes('cancel'))
    return { intent: 'CANCEL' };
  return { intent: 'UNKNOWN' };
}

const VEHICLES = [
  { id: 1, emoji: '🚗', name: 'RideGo',  desc: 'Up to 4 passengers', price: '$8.50',  priceNum: 8.5,  eta: '3 min' },
  { id: 2, emoji: '🚙', name: 'Comfort', desc: 'Premium sedan',       price: '$12.00', priceNum: 12.0, eta: '5 min' },
  { id: 3, emoji: '🚐', name: 'SUV XL',  desc: 'Up to 6, luggage',    price: '$18.50', priceNum: 18.5, eta: '7 min' },
];

const SUGGESTIONS = [
  { label: 'International Airport Terminal 2', emoji: '✈️' },
  { label: 'Central Mall, MG Road',            emoji: '🛍️' },
  { label: 'City Hospital, Park Street',        emoji: '🏥' },
  { label: 'Tech Park, Electronic City',        emoji: '💼' },
  { label: 'Railway Station, Platform 1',       emoji: '🚂' },
  { label: 'Downtown City Center',              emoji: '🏙️' },
];

const QUICK_CMDS = [
  { label: '✈️ Airport',      cmd: 'book a ride to the airport' },
  { label: '💼 Office',       cmd: 'take me to tech park office' },
  { label: '🛍️ Mall',         cmd: 'going to the mall' },
  { label: '🏥 Hospital',     cmd: 'need a ride to hospital' },
  { label: '🚂 Station',      cmd: 'railway station please' },
  { label: '🚐 SUV + bags',   cmd: 'I need an SUV, have 3 bags' },
];

const DRIVER = {
  name: 'Rahul Sharma', emoji: '👨', rating: '4.92',
  trips: '1,284', plate: 'KA-05-MN-3421', car: 'Silver Honda City',
};

const MATCH_STEPS = [
  'Scanning 24 nearby drivers…',
  'Filtering by rating ≥ 4.5…',
  'Checking route familiarity…',
  'Calculating ETA accuracy…',
  'Found your perfect driver! ✅',
];

const TRACK_PHASES = [
  { label: 'Driver en route to you',       emoji: '🚗', color: C.accent },
  { label: 'Driver arrived nearby',         emoji: '📍', color: C.yellow },
  { label: 'Ride in progress',              emoji: '🛣️', color: C.green },
  { label: 'Approaching destination',       emoji: '🏁', color: C.green },
  { label: 'Arrived! Rate your ride',       emoji: '⭐', color: C.yellow },
];

// ── Reusable components ────────────────────────────────────

function AIBubble({ message }) {
  const [display, setDisplay] = useState('');
  useEffect(() => {
    setDisplay('');
    let i = 0;
    const t = setInterval(() => {
      if (i < message.length) { setDisplay(message.slice(0, ++i)); }
      else clearInterval(t);
    }, 16);
    return () => clearInterval(t);
  }, [message]);
  return (
    <View style={s.bubbleRow}>
      <View style={s.bubbleAvatar}><Text style={{ fontSize: 16 }}>🤖</Text></View>
      <View style={s.bubble}><Text style={s.bubbleText}>{display || '…'}</Text></View>
    </View>
  );
}

function VoiceMic({ listening, onPress }) {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (listening) {
      const a = Animated.loop(Animated.sequence([
        Animated.timing(pulse, { toValue: 1.35, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,    duration: 600, useNativeDriver: true }),
      ]));
      a.start();
      return () => a.stop();
    }
    pulse.setValue(1);
  }, [listening]);
  return (
    <View style={{ alignItems: 'center' }}>
      <Animated.View style={[s.micOuter, { transform: [{ scale: pulse }], backgroundColor: listening ? C.accent2 + '33' : C.accent + '22' }]}>
        <TouchableOpacity
          style={[s.micBtn, { backgroundColor: listening ? C.accent2 : C.accent }]}
          onPress={onPress} activeOpacity={0.8}
        >
          <Text style={{ fontSize: 32 }}>🎙️</Text>
        </TouchableOpacity>
      </Animated.View>
      <Text style={[s.muted, { marginTop: 10, fontSize: 13 }]}>
        {listening ? '🔴  Listening…' : 'Tap to speak'}
      </Text>
    </View>
  );
}

function MapBox({ pickup, dropoff }) {
  const car = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.timing(car, { toValue: 1, duration: 2600, useNativeDriver: false }),
      Animated.timing(car, { toValue: 0, duration: 0,    useNativeDriver: false }),
    ]));
    a.start();
    return () => a.stop();
  }, []);
  const left = car.interpolate({ inputRange: [0, 1], outputRange: ['14%', '78%'] });
  return (
    <View style={s.mapBox}>
      <View style={s.mapGrid1} /><View style={s.mapGrid2} />
      <View style={s.mapGrid3} /><View style={s.mapGrid4} />
      <View style={s.mapRoute} />
      <View style={[s.mapDot, { left: '14%', backgroundColor: C.green }]} />
      <View style={[s.mapDot, { right: '14%', backgroundColor: C.accent2 }]} />
      <View style={[s.mapLbl, { left: '8%', top: '18%' }]}><Text style={s.mapLblTxt}>📍 {(pickup || 'You').substring(0,10)}</Text></View>
      <View style={[s.mapLbl, { right: '4%', top: '18%' }]}><Text style={s.mapLblTxt}>🔴 {(dropoff || 'Drop').substring(0,10)}</Text></View>
      {dropoff ? <Animated.Text style={[s.mapCar, { left }]}>🚗</Animated.Text> : null}
    </View>
  );
}

// ── Screen: Home ───────────────────────────────────────────
function HomeScreen({ goTo, setBooking }) {
  const [listening, setListening] = useState(false);
  const [aiMsg, setAiMsg] = useState('Welcome to Ride AI! Where would you like to go today?');
  const phraseRef = useRef(0);
  const phrases = ['Book me a ride to the airport', 'I need an SUV, 3 bags', 'Take me to the mall', 'Get me to the railway station'];

  function handleMic() {
    if (listening) { setListening(false); return; }
    setListening(true);
    const phrase = phrases[phraseRef.current++ % phrases.length];
    setTimeout(() => {
      setListening(false);
      processCmd(phrase);
    }, 2000);
  }

  function processCmd(text) {
    const intent = parseIntent(text);
    if (intent.intent === 'DEST') {
      const msg = `Great! Setting destination to ${intent.destination}. Finding available rides…`;
      setAiMsg(msg);
      setBooking(b => ({ ...b, destination: intent.destination }));
      setTimeout(() => goTo('vehicle'), 1800);
    } else if (intent.intent === 'VEHICLE') {
      setAiMsg('Navigating to ride selection…');
      setTimeout(() => goTo('vehicle'), 1200);
    } else {
      setAiMsg("I didn't catch that. Try: 'Book a ride to the airport' or tap a quick command.");
    }
  }

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.pad} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <Text style={s.logo}>Ride<Text style={{ color: C.accent }}>AI</Text></Text>
        <Text style={s.chip}>🤖 Agentic AI</Text>
      </View>
      <Text style={s.h1}>Good morning 👋</Text>
      <Text style={[s.muted, { marginBottom: 20 }]}>Tap the mic and tell me where you want to go</Text>
      <AIBubble message={aiMsg} />
      <View style={{ marginVertical: 28 }}>
        <VoiceMic listening={listening} onPress={handleMic} />
      </View>
      <Text style={s.sectionTitle}>Quick Commands</Text>
      <View style={s.chipRow}>
        {QUICK_CMDS.map(q => (
          <TouchableOpacity key={q.cmd} style={s.chipBtn} onPress={() => processCmd(q.cmd)}>
            <Text style={s.chipTxt}>{q.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={s.manualBtn} onPress={() => goTo('location')}>
        <Text style={{ fontSize: 16 }}>🗺️</Text>
        <Text style={[s.text, { flex: 1, marginLeft: 10 }]}>Enter destination manually</Text>
        <Text style={s.muted}>›</Text>
      </TouchableOpacity>
      <Text style={s.sectionTitle}>Recent Rides</Text>
      {[
        { dest: 'International Airport', date: 'Yesterday · $12.50', emoji: '✈️' },
        { dest: 'Central Mall',          date: '2 days ago · $8.00',  emoji: '🛍️' },
        { dest: 'Tech Park',             date: '3 days ago · $6.50',  emoji: '💼' },
      ].map(r => (
        <TouchableOpacity key={r.dest} style={s.recentRow}
          onPress={() => { setBooking(b => ({ ...b, destination: r.dest })); goTo('vehicle'); }}>
          <View style={s.recentIcon}><Text style={{ fontSize: 20 }}>{r.emoji}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={s.text}>{r.dest}</Text>
            <Text style={s.muted}>{r.date}</Text>
          </View>
          <Text style={s.muted}>↺</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

// ── Screen: Location ───────────────────────────────────────
function LocationScreen({ goTo, goBack, booking, setBooking }) {
  const [dropoff, setDropoff] = useState(booking.destination || '');
  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.pad} keyboardShouldPersistTaps="handled">
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={goBack}><Text style={s.text}>←</Text></TouchableOpacity>
        <Text style={s.h2}>Set Your Route</Text>
      </View>
      <AIBubble message="Where would you like to go? Type or tap a suggestion below." />
      <View style={s.inputCard}>
        <View style={s.inputRow}>
          <View style={[s.dot, { backgroundColor: C.green }]} />
          <Text style={[s.text, { flex: 1, opacity: 0.5 }]} numberOfLines={1}>{booking.pickup}</Text>
        </View>
        <View style={s.divider} />
        <View style={s.inputRow}>
          <View style={[s.dot, { backgroundColor: C.accent2 }]} />
          <TextInput
            style={[s.text, { flex: 1 }]}
            value={dropoff}
            onChangeText={setDropoff}
            placeholder="Where to?"
            placeholderTextColor={C.muted}
            autoFocus
          />
          {dropoff.length > 0 && (
            <TouchableOpacity onPress={() => setDropoff('')}><Text style={s.muted}>✕</Text></TouchableOpacity>
          )}
        </View>
      </View>
      <MapBox pickup={booking.pickup} dropoff={dropoff} />
      <Text style={s.sectionTitle}>Popular Destinations</Text>
      {SUGGESTIONS.map(sg => (
        <TouchableOpacity key={sg.label} style={s.recentRow} onPress={() => setDropoff(sg.label)}>
          <View style={s.recentIcon}><Text style={{ fontSize: 18 }}>{sg.emoji}</Text></View>
          <Text style={[s.text, { flex: 1 }]}>{sg.label}</Text>
          <Text style={s.muted}>›</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={[s.ctaBtn, !dropoff.trim() && { backgroundColor: C.border }]}
        disabled={!dropoff.trim()}
        onPress={() => { setBooking(b => ({ ...b, destination: dropoff })); goTo('vehicle'); }}
      >
        <Text style={s.ctaTxt}>Find Available Rides →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ── Screen: Vehicle ────────────────────────────────────────
function VehicleScreen({ goTo, goBack, booking, setBooking }) {
  const [sel, setSel] = useState(VEHICLES[0]);
  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.pad} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={goBack}><Text style={s.text}>←</Text></TouchableOpacity>
        <Text style={s.h2}>Choose Your Ride</Text>
      </View>
      <AIBubble message={`I recommend ${sel.name} — ${sel.eta} away, ${sel.price}. Shall I confirm?`} />
      <MapBox pickup={booking.pickup} dropoff={booking.destination} />
      {VEHICLES.map(v => (
        <TouchableOpacity key={v.id} style={[s.vCard, sel.id === v.id && s.vCardSel]} onPress={() => setSel(v)}>
          <Text style={{ fontSize: 36 }}>{v.emoji}</Text>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[s.text, { fontWeight: '700', fontSize: 16 }]}>{v.name}</Text>
            <Text style={s.muted}>{v.desc}</Text>
            <Text style={[s.muted, { color: C.green }]}>🕐 {v.eta}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[s.text, { fontWeight: '800', fontSize: 18, color: C.accent }]}>{v.price}</Text>
            {sel.id === v.id && <Text style={{ color: C.accent, fontSize: 20 }}>✓</Text>}
          </View>
        </TouchableOpacity>
      ))}
      <View style={s.fareCard}>
        <Text style={[s.text, { fontWeight: '700', marginBottom: 8 }]}>💰 Fare Breakdown</Text>
        {[['Base fare','$4.00'],['Distance (4.2 km)',`$${(sel.priceNum - 4 - 0.5).toFixed(2)}`],['AI demand pricing','$0.50']].map(([l,v]) => (
          <View key={l} style={s.fareRow}><Text style={s.muted}>{l}</Text><Text style={s.text}>{v}</Text></View>
        ))}
        <View style={[s.fareRow, { borderBottomWidth: 0, paddingTop: 8 }]}>
          <Text style={[s.text, { fontWeight: '700', fontSize: 15 }]}>Total</Text>
          <Text style={[s.text, { fontWeight: '800', fontSize: 16, color: C.accent }]}>{sel.price}</Text>
        </View>
      </View>
      <TouchableOpacity style={s.ctaBtn} onPress={() => { setBooking(b => ({ ...b, vehicle: sel })); goTo('matching'); }}>
        <Text style={s.ctaTxt}>Confirm {sel.name}  •  {sel.price}  →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ── Screen: Matching ───────────────────────────────────────
function MatchingScreen({ goTo, goBack, booking }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [found, setFound] = useState(false);
  const [aiMsg, setAiMsg] = useState('');
  const spin = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    const a = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 1100, useNativeDriver: true }));
    a.start();
    const stepTimers = MATCH_STEPS.map((_, i) =>
      setTimeout(() => setStepIdx(i), i * 650)
    );
    const revealTimer = setTimeout(() => {
      setFound(true);
      a.stop();
      const msg = `Found your driver! Rahul Sharma, rated 4.92 stars, arriving in 4 minutes.`;
      setAiMsg(msg);
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
    }, MATCH_STEPS.length * 650 + 400);
    return () => { stepTimers.forEach(clearTimeout); clearTimeout(revealTimer); };
  }, []);

  const rot = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.pad} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={goBack}><Text style={s.text}>←</Text></TouchableOpacity>
        <Text style={s.h2}>{found ? 'Driver Found! 🎉' : 'Finding Your Driver'}</Text>
      </View>

      {!found ? (
        <View style={{ alignItems: 'center', marginTop: 30 }}>
          <View style={{ width: 110, height: 110, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <Animated.View style={[s.spinRing, { transform: [{ rotate: rot }] }]} />
            <View style={s.spinCenter}>
              <Text style={{ fontSize: 36 }}>{booking.vehicle?.emoji || '🚗'}</Text>
            </View>
          </View>
          {MATCH_STEPS.map((step, i) => (
            <View key={step} style={[s.stepRow, { opacity: i <= stepIdx ? 1 : 0.3 }]}>
              <View style={[s.stepDot, i <= stepIdx && { backgroundColor: C.accent }]} />
              <Text style={[s.text, { fontSize: 13 }]}>{step}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Animated.View style={{ transform: [{ scale }], gap: 14 }}>
          <AIBubble message={aiMsg} />
          <View style={s.driverCard}>
            <View style={s.driverAvatar}><Text style={{ fontSize: 28 }}>👨</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={[s.text, { fontWeight: '700', fontSize: 16 }]}>{DRIVER.name}</Text>
              <Text style={{ color: C.yellow, fontSize: 13 }}>⭐ {DRIVER.rating} · {DRIVER.trips} trips</Text>
              <Text style={s.muted}>🚗 {DRIVER.plate} · {DRIVER.car}</Text>
            </View>
            <View style={[s.etaBadge]}>
              <Text style={[s.text, { fontWeight: '800', fontSize: 18, color: C.accent }]}>4 min</Text>
              <Text style={[s.muted, { fontSize: 10 }]}>ETA</Text>
            </View>
          </View>
          <View style={s.aiInsightCard}>
            <Text style={[s.text, { fontWeight: '700', marginBottom: 8 }]}>🤖 Why Rahul?</Text>
            {[['Proximity','0.8 km',C.green],['Rating','4.92 / 5.0',C.yellow],['On-time %','97%',C.accent],['Route familiarity','High',C.green]].map(([k,v,cl]) => (
              <View key={k} style={{ flexDirection:'row', justifyContent:'space-between', paddingVertical: 4 }}>
                <Text style={s.muted}>{k}</Text><Text style={{ color: cl, fontWeight:'600' }}>{v}</Text>
              </View>
            ))}
          </View>
          <View style={s.routeCard}>
            <View style={s.routePoint}><View style={[s.dot, { backgroundColor: C.green }]} /><Text style={[s.text, { flex:1, fontSize:13 }]} numberOfLines={1}>{booking.pickup}</Text></View>
            <View style={{ width: 2, height: 12, backgroundColor: C.border, marginLeft: 5, marginVertical: 2 }} />
            <View style={s.routePoint}><View style={[s.dot, { backgroundColor: C.accent2 }]} /><Text style={[s.text, { flex:1, fontSize:13 }]} numberOfLines={1}>{booking.destination}</Text></View>
          </View>
          <TouchableOpacity style={s.ctaBtn} onPress={() => goTo('tracking')}>
            <Text style={s.ctaTxt}>✅  Accept & Confirm Ride</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.outlineBtn} onPress={goBack}>
            <Text style={[s.muted, { fontSize: 14 }]}>Change Vehicle</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </ScrollView>
  );
}

// ── Screen: Tracking ───────────────────────────────────────
function TrackingScreen({ goTo, booking }) {
  const [eta, setEta] = useState(240);
  const [phase, setPhase] = useState(0);
  const [aiMsg, setAiMsg] = useState('Your ride is confirmed. Rahul is on his way!');
  const [rating, setRating] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const progAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const iv = setInterval(() => setEta(e => Math.max(0, e - 1)), 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const msgs = [
      [12000, 1, 'Rahul has arrived nearby. Please come to the pickup point.'],
      [25000, 2, 'Ride started! Estimated 18 minutes to your destination.'],
      [42000, 3, 'Approaching your destination. Please gather your belongings.'],
      [55000, 4, "You've arrived! Please rate your experience."],
    ];
    const timers = msgs.map(([ms, p, msg]) =>
      setTimeout(() => {
        setPhase(p);
        setAiMsg(msg);
        Animated.timing(progAnim, { toValue: p / (TRACK_PHASES.length - 1), duration: 500, useNativeDriver: false }).start();
        if (p === 4) setTimeout(() => setShowRating(true), 1500);
      }, ms)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  function fmtEta(s) {
    if (s === 0) return 'Here!';
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  if (showRating) {
    return (
      <SafeAreaView style={[s.safe, { justifyContent: 'center', alignItems: 'center', padding: 32 }]}>
        <Text style={{ fontSize: 56, marginBottom: 16 }}>⭐</Text>
        <Text style={[s.h1, { textAlign: 'center' }]}>Rate Your Ride</Text>
        <Text style={[s.muted, { textAlign: 'center', marginBottom: 32 }]}>How was your experience with Rahul?</Text>
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 32 }}>
          {[1,2,3,4,5].map(n => (
            <TouchableOpacity key={n} onPress={() => setRating(n)}>
              <Text style={{ fontSize: 46, color: n <= rating ? C.yellow : C.border }}>★</Text>
            </TouchableOpacity>
          ))}
        </View>
        {rating > 0 && (
          <TouchableOpacity style={s.ctaBtn} onPress={() => goTo('home')}>
            <Text style={s.ctaTxt}>Submit Rating · Book Another</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    );
  }

  const progWidth = progAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.pad} showsVerticalScrollIndicator={false}>
      <View style={[s.header, { justifyContent: 'space-between' }]}>
        <Text style={s.h2}>Live Tracking</Text>
        <View style={s.etaBadge}>
          <Text style={[s.text, { fontWeight: '800', fontSize: 20, color: C.accent }]}>{fmtEta(eta)}</Text>
          <Text style={[s.muted, { fontSize: 10 }]}>ETA</Text>
        </View>
      </View>

      <View style={s.statusCard}>
        <Text style={{ fontSize: 22 }}>{TRACK_PHASES[phase].emoji}</Text>
        <Text style={[s.text, { fontWeight: '600', marginLeft: 10, color: TRACK_PHASES[phase].color }]}>
          {TRACK_PHASES[phase].label}
        </Text>
      </View>

      <View style={s.progressTrack}>
        <Animated.View style={[s.progressFill, { width: progWidth }]} />
      </View>

      <AIBubble message={aiMsg} />
      <MapBox pickup={booking.pickup} dropoff={booking.destination} />

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
        {[['4.2 km','Distance'],['18 min','Est. Time'],[booking.vehicle?.price || '$8.50','Fare']].map(([v,l]) => (
          <View key={l} style={s.statBox}>
            <Text style={[s.text, { fontWeight: '700', fontSize: 15 }]}>{v}</Text>
            <Text style={[s.muted, { fontSize: 11 }]}>{l}</Text>
          </View>
        ))}
      </View>

      <View style={s.driverCard}>
        <View style={s.driverAvatar}><Text style={{ fontSize: 28 }}>👨</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={[s.text, { fontWeight: '700' }]}>Rahul Sharma</Text>
          <Text style={{ color: C.yellow, fontSize: 13 }}>⭐ 4.92 · Silver Honda City</Text>
          <Text style={s.muted}>KA-05-MN-3421</Text>
        </View>
        <View style={{ gap: 8 }}>
          <TouchableOpacity style={s.iconBtn}><Text>📞</Text></TouchableOpacity>
          <TouchableOpacity style={s.iconBtn}><Text>💬</Text></TouchableOpacity>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <TouchableOpacity style={[s.outlineBtn, { flex: 1 }]}>
          <Text style={[s.text, { fontSize: 13 }]}>🔗 Share Trip</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.outlineBtn, { flex: 1, borderColor: C.accent2 }]}>
          <Text style={[s.text, { fontSize: 13, color: C.accent2 }]}>🆘 SOS</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[s.outlineBtn, { borderColor: C.red }]}
        onPress={() => Alert.alert('Cancel Ride?', 'No charges will be applied.', [
          { text: 'No' },
          { text: 'Yes, Cancel', style: 'destructive', onPress: () => goTo('home') },
        ])}
      >
        <Text style={{ color: C.red, fontWeight: '600', fontSize: 14 }}>Cancel Ride</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ── Root App with simple screen router ────────────────────
export default function App() {
  const [screen, setScreen] = useState('home');
  const [history, setHistory] = useState([]);
  const [booking, setBooking] = useState({
    pickup: '123 Main Street, Downtown',
    destination: '',
    vehicle: null,
  });

  function goTo(scr) {
    setHistory(h => [...h, screen]);
    setScreen(scr);
  }
  function goBack() {
    setHistory(h => {
      const prev = [...h];
      const last = prev.pop();
      setScreen(last || 'home');
      return prev;
    });
  }

  const props = { goTo, goBack, booking, setBooking };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      {screen === 'home'     && <HomeScreen     {...props} />}
      {screen === 'location' && <LocationScreen {...props} />}
      {screen === 'vehicle'  && <VehicleScreen  {...props} />}
      {screen === 'matching' && <MatchingScreen {...props} />}
      {screen === 'tracking' && <TrackingScreen {...props} />}
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: C.bg },
  scroll:      { flex: 1, backgroundColor: C.bg },
  pad:         { padding: 20, paddingBottom: 60 },
  text:        { color: C.text, fontSize: 14 },
  muted:       { color: C.muted, fontSize: 13 },
  h1:          { fontSize: 26, fontWeight: '700', color: C.text, marginBottom: 4 },
  h2:          { fontSize: 18, fontWeight: '700', color: C.text },
  header:      { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
  logo:        { fontSize: 24, fontWeight: '800', color: C.text },
  chip:        { backgroundColor: C.surface2, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, fontSize: 11, color: C.muted },
  sectionTitle:{ fontSize: 14, fontWeight: '600', color: C.muted, marginTop: 20, marginBottom: 10 },
  chipRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chipBtn:     { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 },
  chipTxt:     { color: C.text, fontSize: 13 },
  manualBtn:   { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 14, marginTop: 12 },
  recentRow:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: C.border, gap: 12 },
  recentIcon:  { width: 42, height: 42, borderRadius: 21, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
  backBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  inputCard:   { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 14, marginBottom: 4 },
  inputRow:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot:         { width: 10, height: 10, borderRadius: 5 },
  divider:     { height: 1, backgroundColor: C.border, marginVertical: 8, marginLeft: 20 },
  ctaBtn:      { backgroundColor: C.accent, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 12 },
  ctaTxt:      { color: 'white', fontSize: 15, fontWeight: '700' },
  outlineBtn:  { borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 8 },
  vCard:       { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderWidth: 2, borderColor: C.border, borderRadius: 14, padding: 16, marginBottom: 10 },
  vCardSel:    { borderColor: C.accent, backgroundColor: 'rgba(108,99,255,0.1)' },
  fareCard:    { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 14, marginTop: 4 },
  fareRow:     { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderColor: C.border },
  driverCard:  { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface2, borderRadius: 14, padding: 14, gap: 12, marginVertical: 4 },
  driverAvatar:{ width: 52, height: 52, borderRadius: 26, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.accent },
  etaBadge:    { backgroundColor: C.surface2, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6, alignItems: 'center', borderWidth: 1, borderColor: C.accent },
  aiInsightCard:{ backgroundColor: 'rgba(108,99,255,0.1)', borderWidth: 1, borderColor: 'rgba(108,99,255,0.3)', borderRadius: 12, padding: 14 },
  routeCard:   { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 14, gap: 4 },
  routePoint:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  spinRing:    { position: 'absolute', width: 108, height: 108, borderRadius: 54, borderWidth: 4, borderColor: C.border, borderTopColor: C.accent },
  spinCenter:  { width: 76, height: 76, borderRadius: 38, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
  stepRow:     { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 4, alignSelf: 'stretch', paddingHorizontal: 10 },
  stepDot:     { width: 8, height: 8, borderRadius: 4, backgroundColor: C.border },
  statusCard:  { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: C.border, marginBottom: 8 },
  progressTrack:{ height: 4, backgroundColor: C.border, borderRadius: 2, marginBottom: 12, overflow: 'hidden' },
  progressFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: C.accent, borderRadius: 2 },
  statBox:     { flex: 1, backgroundColor: C.surface, borderRadius: 10, borderWidth: 1, borderColor: C.border, padding: 10, alignItems: 'center', gap: 4 },
  iconBtn:     { width: 34, height: 34, borderRadius: 17, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  micOuter:    { width: 140, height: 140, borderRadius: 70, alignItems: 'center', justifyContent: 'center' },
  micBtn:      { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', shadowColor: C.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 8 },
  bubbleRow:   { flexDirection: 'row', alignItems: 'flex-end', marginVertical: 10, gap: 10 },
  bubbleAvatar:{ width: 34, height: 34, borderRadius: 17, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
  bubble:      { flex: 1, backgroundColor: C.surface2, borderRadius: 14, borderBottomLeftRadius: 4, padding: 14, borderWidth: 1, borderColor: C.border },
  bubbleText:  { color: C.text, fontSize: 14, lineHeight: 21 },
  mapBox:      { height: 160, backgroundColor: C.surface2, borderRadius: 12, overflow: 'hidden', marginVertical: 10, position: 'relative' },
  mapGrid1:    { position: 'absolute', left: 0, right: 0, top: '33%', height: 1, backgroundColor: C.border, opacity: 0.4 },
  mapGrid2:    { position: 'absolute', left: 0, right: 0, top: '66%', height: 1, backgroundColor: C.border, opacity: 0.4 },
  mapGrid3:    { position: 'absolute', top: 0, bottom: 0, left: '33%', width: 1, backgroundColor: C.border, opacity: 0.4 },
  mapGrid4:    { position: 'absolute', top: 0, bottom: 0, left: '66%', width: 1, backgroundColor: C.border, opacity: 0.4 },
  mapRoute:    { position: 'absolute', left: '18%', right: '18%', top: '50%', height: 3, borderRadius: 2, backgroundColor: C.accent, opacity: 0.7 },
  mapDot:      { position: 'absolute', top: '44%', width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: 'white' },
  mapLbl:      { position: 'absolute', backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  mapLblTxt:   { fontSize: 10, color: C.muted },
  mapCar:      { position: 'absolute', top: '32%', fontSize: 22 },
});
