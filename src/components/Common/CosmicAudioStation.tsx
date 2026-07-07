"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { useWeatherStore } from "@/store/useWeatherStore";
import { motion, AnimatePresence } from "framer-motion";

export default function CosmicAudioStation() {
  const { weather } = useWeatherStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4); // 기본 볼륨 40%
  const [showVolume, setShowVolume] = useState(false);

  // Web Audio API 관련 refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  
  // 날씨별 노드 관리
  const sourcesRef = useRef<any[]>([]);
  const intervalsRef = useRef<any[]>([]);

  // Web Audio Context 초기화
  const initAudio = () => {
    if (audioCtxRef.current) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(volume, ctx.currentTime);
    mainGain.connect(ctx.destination);
    
    audioCtxRef.current = ctx;
    gainNodeRef.current = mainGain;
  };

  // 노이즈 버퍼 생성기 (빗소리, 바람소리에 사용)
  const createNoiseBuffer = (type: "white" | "pink") => {
    if (!audioCtxRef.current) return null;
    const bufferSize = audioCtxRef.current.sampleRate * 2; // 2초
    const buffer = audioCtxRef.current.createBuffer(1, bufferSize, audioCtxRef.current.sampleRate);
    const data = buffer.getChannelData(0);
    
    if (type === "white") {
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    } else {
      // Pink Noise approximation
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        b6 = white * 0.115926;
        data[i] = pink * 0.11; // 볼륨 정규화
      }
    }
    return buffer;
  };

  // 모든 오디오 생성 노드 정지
  const stopAllSounds = () => {
    sourcesRef.current.forEach((src) => {
      try {
        src.stop();
      } catch (e) {}
    });
    sourcesRef.current = [];
    
    intervalsRef.current.forEach((intervalId) => clearInterval(intervalId));
    intervalsRef.current = [];
  };

  // 실시간 사운드 합성 엔진
  const startSound = (currentWeather: string) => {
    if (!audioCtxRef.current || !gainNodeRef.current) return;
    stopAllSounds();

    // AudioContext가 정지(suspended) 상태라면 재시작
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }

    const ctx = audioCtxRef.current;
    const destination = gainNodeRef.current;

    if (currentWeather === "rainy") {
      // 🌧️ 실시간 빗소리 합성 (화이트 노이즈 + 로우패스 필터 + 미세 볼륨 LFO)
      const noiseBuffer = createNoiseBuffer("white");
      if (!noiseBuffer) return;

      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      filter.Q.setValueAtTime(1, ctx.currentTime);

      // 빗소리의 풍성함을 더해주는 2번째 높은 필터
      const filter2 = ctx.createBiquadFilter();
      filter2.type = "bandpass";
      filter2.frequency.setValueAtTime(1600, ctx.currentTime);
      filter2.Q.setValueAtTime(0.5, ctx.currentTime);

      const subGain1 = ctx.createGain();
      subGain1.gain.setValueAtTime(0.8, ctx.currentTime);

      const subGain2 = ctx.createGain();
      subGain2.gain.setValueAtTime(0.12, ctx.currentTime);

      source.connect(filter);
      filter.connect(subGain1);
      subGain1.connect(destination);

      source.connect(filter2);
      filter2.connect(subGain2);
      subGain2.connect(destination);

      source.start();
      sourcesRef.current.push(source);

      // 가끔씩 내리치는 미세한 빗줄기(간헐적 오실레이터 서지)
      const rainSpurt = () => {
        const osc = ctx.createOscillator();
        const spurGain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(120, ctx.currentTime);
        spurGain.gain.setValueAtTime(0.02, ctx.currentTime);
        
        const bpf = ctx.createBiquadFilter();
        bpf.type = "bandpass";
        bpf.frequency.setValueAtTime(2000, ctx.currentTime);
        bpf.Q.setValueAtTime(8, ctx.currentTime);

        osc.connect(bpf);
        bpf.connect(spurGain);
        spurGain.connect(destination);

        spurGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
        osc.start();
        osc.stop(ctx.currentTime + 1.2);
      };
      
      const interval = setInterval(rainSpurt, 4000);
      intervalsRef.current.push(interval);

    } else if (currentWeather === "sunny") {
      // ☀️ 화창함 (부드러운 나뭇잎 바람 소리: 핑크 노이즈 + 주파수가 느리게 스윕하는 로우패스 필터)
      const noiseBuffer = createNoiseBuffer("pink");
      if (!noiseBuffer) return;

      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(350, ctx.currentTime);

      source.connect(filter);
      filter.connect(destination);
      source.start();
      sourcesRef.current.push(source);

      // 느릿하게 바람이 부는 듯한 필터 컷오프 LFO 시뮬레이션
      let time = 0;
      const windLFO = setInterval(() => {
        time += 0.05;
        const cutoff = 300 + Math.sin(time) * 120;
        filter.frequency.setTargetAtTime(cutoff, ctx.currentTime, 0.1);
      }, 50);
      intervalsRef.current.push(windLFO);

      // 가끔씩 지저귀는 힐링 새소리 (높은 주파수 오실레이터 스윕)
      const chirp = () => {
        const osc = ctx.createOscillator();
        const chirpGain = ctx.createGain();
        chirpGain.gain.setValueAtTime(0.015, ctx.currentTime);

        osc.type = "sine";
        osc.frequency.setValueAtTime(3200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(4500, ctx.currentTime + 0.15);
        osc.frequency.exponentialRampToValueAtTime(3000, ctx.currentTime + 0.3);

        osc.connect(chirpGain);
        chirpGain.connect(destination);
        
        chirpGain.gain.setValueAtTime(0.015, ctx.currentTime);
        chirpGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);

        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      };

      const interval = setInterval(() => {
        if (Math.random() > 0.4) {
          chirp();
          setTimeout(chirp, 180);
          if (Math.random() > 0.6) setTimeout(chirp, 360);
        }
      }, 5000);
      intervalsRef.current.push(interval);

    } else if (currentWeather === "snowy") {
      // ❄️ 아늑한 겨울 눈길 (부드러운 앰비언스 험 + 간헐적인 오르골 별빛 소리)
      const oscAmbient = ctx.createOscillator();
      const oscGain = ctx.createGain();
      oscAmbient.type = "sine";
      oscAmbient.frequency.setValueAtTime(110, ctx.currentTime); // A2 험
      oscGain.gain.setValueAtTime(0.08, ctx.currentTime);

      const lpf = ctx.createBiquadFilter();
      lpf.type = "lowpass";
      lpf.frequency.setValueAtTime(180, ctx.currentTime);

      oscAmbient.connect(lpf);
      lpf.connect(oscGain);
      oscGain.connect(destination);
      oscAmbient.start();
      sourcesRef.current.push(oscAmbient);

      // 영롱하게 반짝이는 겨울 오르골 멜로디 합성 (C 메이저 펜타토닉 스케일 무작위 연주)
      const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50]; // C5, D5, E5, G5, A5, C6
      const playMusicBoxNote = () => {
        const freq = notes[Math.floor(Math.random() * notes.length)];
        
        const osc = ctx.createOscillator();
        const boxGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(freq * 1.5, ctx.currentTime);

        boxGain.gain.setValueAtTime(0.04, ctx.currentTime);
        // 서서히 페이드아웃되는 감쇠 엔벨로프
        boxGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.5);

        osc.connect(filter);
        filter.connect(boxGain);
        boxGain.connect(destination);

        osc.start();
        osc.stop(ctx.currentTime + 2.6);
      };

      const musicBoxInterval = setInterval(() => {
        if (Math.random() > 0.3) {
          playMusicBoxNote();
          if (Math.random() > 0.5) {
            setTimeout(playMusicBoxNote, 400);
            if (Math.random() > 0.6) setTimeout(playMusicBoxNote, 800);
          }
        }
      }, 3500);
      intervalsRef.current.push(musicBoxInterval);

    } else if (currentWeather === "cloudy") {
      // ☁️ 나른하고 차분한 도심 화이트 노이즈 & Lo-Fi 감성 험
      const oscBase = ctx.createOscillator();
      const baseGain = ctx.createGain();
      oscBase.type = "sine";
      oscBase.frequency.setValueAtTime(90, ctx.currentTime);
      baseGain.gain.setValueAtTime(0.12, ctx.currentTime);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(140, ctx.currentTime);

      oscBase.connect(filter);
      filter.connect(baseGain);
      baseGain.connect(destination);
      oscBase.start();
      sourcesRef.current.push(oscBase);

      // 나른한 바람 소리 오버레이
      const windBuffer = createNoiseBuffer("pink");
      if (windBuffer) {
        const windNode = ctx.createBufferSource();
        windNode.buffer = windBuffer;
        windNode.loop = true;
        const windGain = ctx.createGain();
        windGain.gain.setValueAtTime(0.08, ctx.currentTime);
        const windFilter = ctx.createBiquadFilter();
        windFilter.type = "bandpass";
        windFilter.frequency.setValueAtTime(400, ctx.currentTime);
        windFilter.Q.setValueAtTime(0.3, ctx.currentTime);

        windNode.connect(windFilter);
        windFilter.connect(windGain);
        windGain.connect(destination);
        windNode.start();
        sourcesRef.current.push(windNode);
      }
    } else {
      // 🌌 Deep Space & Night (우주선 안의 신비로운 공명 Hum + 아날로그 신디사이저 패드)
      // 1. 깊은 험
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const humGain = ctx.createGain();
      
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(73.42, ctx.currentTime); // D2
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(73.97, ctx.currentTime); // 약간 디튜닝해서 맥놀이 생성
      
      humGain.gain.setValueAtTime(0.18, ctx.currentTime);

      const humFilter = ctx.createBiquadFilter();
      humFilter.type = "lowpass";
      humFilter.frequency.setValueAtTime(120, ctx.currentTime);

      osc1.connect(humFilter);
      osc2.connect(humFilter);
      humFilter.connect(humGain);
      humGain.connect(destination);
      
      osc1.start();
      osc2.start();
      sourcesRef.current.push(osc1, osc2);

      // 2. 신비로운 우주 공명음 (LFO 필터 스윕)
      const synthOsc = ctx.createOscillator();
      const synthGain = ctx.createGain();
      synthOsc.type = "sawtooth";
      synthOsc.frequency.setValueAtTime(146.83, ctx.currentTime); // D3
      
      const synthFilter = ctx.createBiquadFilter();
      synthFilter.type = "bandpass";
      synthFilter.frequency.setValueAtTime(300, ctx.currentTime);
      synthFilter.Q.setValueAtTime(3, ctx.currentTime);

      synthGain.gain.setValueAtTime(0.04, ctx.currentTime);

      synthOsc.connect(synthFilter);
      synthFilter.connect(synthGain);
      synthGain.connect(destination);
      synthOsc.start();
      sourcesRef.current.push(synthOsc);

      let synthTime = 0;
      const synthSweep = setInterval(() => {
        synthTime += 0.02;
        const freq = 400 + Math.sin(synthTime) * 200;
        synthFilter.frequency.setTargetAtTime(freq, ctx.currentTime, 0.15);
      }, 50);
      intervalsRef.current.push(synthSweep);
    }
  };

  // 토글 처리
  const togglePlay = () => {
    if (!isPlaying) {
      initAudio();
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
      stopAllSounds();
    }
  };

  // 볼륨 변경 시
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(val, audioCtxRef.current.currentTime, 0.1);
    }
  };

  // 날씨 변경 감지 및 사운드 즉시 변경
  useEffect(() => {
    if (isPlaying) {
      // 0.2초 페이드아웃 후 새 주파수 시작
      if (gainNodeRef.current && audioCtxRef.current) {
        const ctx = audioCtxRef.current;
        gainNodeRef.current.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        
        setTimeout(() => {
          if (isPlaying) {
            startSound(weather);
            if (gainNodeRef.current && audioCtxRef.current) {
              gainNodeRef.current.gain.linearRampToValueAtTime(volume, audioCtxRef.current.currentTime + 0.2);
            }
          }
        }, 160);
      } else {
        startSound(weather);
      }
    } else {
      stopAllSounds();
    }
  }, [weather, isPlaying]);

  // 컴포넌트 언마운트 시 클린업
  useEffect(() => {
    return () => {
      stopAllSounds();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return (
    <div className="relative flex items-center gap-2">
      {/* 🌌 이퀄라이저 애니메이션 바 */}
      <AnimatePresence>
        {isPlaying && (
          <motion.div 
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="flex items-end gap-[3px] h-4 px-2"
          >
            {[...Array(4)].map((_, i) => (
              <motion.span
                key={i}
                animate={{
                  height: [
                    "20%", "90%", "30%", "100%", "40%", "20%"
                  ],
                }}
                transition={{
                  duration: 0.8 + i * 0.15,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className={`w-[2.5px] rounded-full transition-colors duration-1000 ${
                  weather === 'sunny' ? 'bg-amber-500' :
                  weather === 'rainy' ? 'bg-blue-500' :
                  weather === 'snowy' ? 'bg-sky-300' :
                  weather === 'cloudy' ? 'bg-slate-400' :
                  'bg-violet-500'
                }`}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🎧 재생 제어 버튼 */}
      <div 
        className="relative"
        onMouseEnter={() => setShowVolume(true)}
        onMouseLeave={() => setShowVolume(false)}
      >
        <div className="flex items-center gap-2 rounded-full border border-white/60 bg-white/70 p-1.5 shadow-[0_4px_12px_rgba(148,163,184,0.08)] backdrop-blur-md transition hover:border-white/80 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={togglePlay}
            className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-500 ${
              isPlaying
                ? weather === 'sunny' ? 'bg-amber-500 text-white' :
                  weather === 'rainy' ? 'bg-blue-600 text-white' :
                  weather === 'snowy' ? 'bg-sky-400 text-white' :
                  weather === 'cloudy' ? 'bg-slate-500 text-white' :
                  'bg-violet-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/20'
            }`}
            title={isPlaying ? "사운드 끄기" : "우주 앰비언스 사운드 켜기"}
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.063.922-2.063 2.063v4.875c0 1.141.922 2.062 2.063 2.062h1.932l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06zM17.78 9.22a.75.75 0 10-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 001.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 101.06-1.06L20.56 12l1.72-1.72a.75.75 0 00-1.06-1.06l-1.72 1.72-1.72-1.72z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.063.922-2.063 2.063v4.875c0 1.141.922 2.062 2.063 2.062h1.932l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06zM18.563 12c0-1.92-1.13-3.57-2.755-4.33a.75.75 0 11.643-1.356C18.665 7.302 20.063 9.49 20.063 12c0 2.51-1.398 4.698-3.612 5.686a.75.75 0 01-.643-1.356c1.625-.76 2.755-2.41 2.755-4.33z" />
                <path d="M16.244 12c0-.98-.58-1.82-1.424-2.21a.75.75 0 01.62-1.365c1.44.66 2.42 2.1 2.42 3.575 0 1.475-.98 2.915-2.42 3.575a.75.75 0 11-.62-1.365c.844-.39 1.424-1.23 1.424-2.21z" />
              </svg>
            )}
          </motion.button>

          {/* 🔊 마우스 호버 시 슬라이딩하여 등장하는 미세한 볼륨 조절기 */}
          <AnimatePresence>
            {showVolume && (
              <motion.div
                initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                animate={{ opacity: 1, width: 64, marginLeft: 4 }}
                exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                className="flex items-center overflow-hidden h-7"
              >
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-16 accent-violet-600 dark:accent-white cursor-pointer h-1.5 rounded-lg bg-slate-200 dark:bg-white/20"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
