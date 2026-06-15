import Footer from '@/components/Footer';
import { getUserInfo, verifyGoogleLogin } from '@/services/base/api';
import { message } from 'antd';
import React from 'react';
import { history, useModel } from 'umi';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import styles from './index.less';

declare const APP_CONFIG_GOOGLE_CLIENT_ID: string;

const PILLS = [
  'Mô phỏng 3D thời gian thực',
  'AI trợ giảng thông minh',
  'SGK Vật lý, Hóa, Toán',
];

const STATS = [
  { num: '90+', label: 'Thí nghiệm' },
  null,
  { num: '3', label: 'Môn học' },
  null,
  { num: '100%', label: 'Miễn phí' },
];

// 15 particles with deterministic varied positions
const PARTICLES = Array.from({ length: 15 }, (_, i) => ({
  left: `${(i * 6.5 + 3) % 93}%`,
  delay: `${((i * 0.55) % 7).toFixed(1)}s`,
  duration: `${9 + (i % 5)}s`,
  size: `${2 + (i % 3)}px`,
  drift: `${(i % 2 === 0 ? 1 : -1) * (15 + (i * 7) % 40)}px`,
}));

// 8 twinkling star dots
const TWINKLES = [
  { top: '12%', left: '8%',  delay: '0s',    dur: '3.2s' },
  { top: '22%', left: '82%', delay: '0.8s',  dur: '4.1s' },
  { top: '55%', left: '6%',  delay: '1.6s',  dur: '3.7s' },
  { top: '70%', left: '90%', delay: '0.4s',  dur: '2.9s' },
  { top: '38%', left: '72%', delay: '2.1s',  dur: '4.5s' },
  { top: '85%', left: '18%', delay: '1.2s',  dur: '3.4s' },
  { top: '8%',  left: '55%', delay: '2.8s',  dur: '2.8s' },
  { top: '90%', left: '68%', delay: '0.6s',  dur: '3.9s' },
];

const Login: React.FC = () => {
  const { initialState, setInitialState } = useModel('@@initialState');

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const idToken = credentialResponse.credential;
      const res = await verifyGoogleLogin({ token: idToken });
      const accessToken = res.data?.data?.access_token || res.data?.access_token;

      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('token', accessToken);

      const info = await getUserInfo();
      setInitialState({
        ...initialState,
        currentUser: info.data?.data || info.data,
      });

      message.success('Đăng nhập thành công');
      history.push('/dashboard');
    } catch {
      message.error('Đăng nhập thất bại');
    }
  };

  return (
    <div className={styles.container}>

      {/* ── Background layers ── */}
      <div className={styles.bgMesh} />
      <div className={styles.bgGrid} />

      {/* Glow orbs */}
      <div className={styles.glowOrbs}>
        <div className={`${styles.orb} ${styles.orb1}`} />
        <div className={`${styles.orb} ${styles.orb2}`} />
        <div className={`${styles.orb} ${styles.orb3}`} />
      </div>

      {/* Light beam sweeps */}
      <div className={styles.beams}>
        <div className={`${styles.beam} ${styles.beam1}`} />
        <div className={`${styles.beam} ${styles.beam2}`} />
      </div>

      {/* Floating particles rising */}
      <div className={styles.particles}>
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            className={styles.particle}
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              animationDelay: p.delay,
              animationDuration: p.duration,
              '--drift': p.drift,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Twinkling stars */}
      <div className={styles.twinkles}>
        {TWINKLES.map((t, i) => (
          <div
            key={i}
            className={styles.twinkle}
            style={{
              top: t.top,
              left: t.left,
              animationDelay: t.delay,
              animationDuration: t.dur,
            }}
          />
        ))}
      </div>

      {/* ── Content ── */}
      <div className={styles.contentWrapper}>

        {/* Left panel */}
        <div className={styles.leftPanel}>

          {/* Atom + floating tags */}
          <div className={styles.heroVisual}>
            <div className={`${styles.floatTag} ${styles.ftag1}`}>Mô phỏng 3D</div>
            <div className={`${styles.floatTag} ${styles.ftag2}`}>AI Trợ giảng</div>
            <div className={`${styles.floatTag} ${styles.ftag3}`}>SGK 10 – 12</div>

            <div className={styles.scienceArt}>
              {/* Expanding pulse rings */}
              <div className={styles.pulseRing} />
              <div className={`${styles.pulseRing} ${styles.pulseRing2}`} />
              <div className={`${styles.pulseRing} ${styles.pulseRing3}`} />

              {/* Orbit rings */}
              <div className={`${styles.ring} ${styles.ring1}`} />
              <div className={`${styles.ring} ${styles.ring2}`} />
              <div className={`${styles.ring} ${styles.ring3}`} />

              {/* Nucleus */}
              <div className={styles.nucleus} />

              {/* Electrons — siblings of rings to avoid double-rotation */}
              <div className={`${styles.electron} ${styles.ea}`} />
              <div className={`${styles.electron} ${styles.eb}`} />
              <div className={`${styles.electron} ${styles.ec}`} />
            </div>
          </div>

          {/* Badge */}
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            <span>AI Study Simulator · Phiên bản 1.0</span>
          </div>

          {/* Title — word-by-word reveal */}
          <h1 className={styles.heroTitle}>
            <span className={`${styles.word} ${styles.w1}`}>Phòng</span>{' '}
            <span className={`${styles.word} ${styles.w2}`}>thí</span>{' '}
            <span className={`${styles.word} ${styles.w3}`}>nghiệm</span>
            <br />
            <span className={`${styles.word} ${styles.w4}`}>
              <span className={styles.gradientText}>số trong tầm tay</span>
            </span>
          </h1>

          <p className={styles.heroSub}>
            Trải nghiệm khoa học qua mô phỏng 3D tương tác — không cần thiết bị,
            không cần phòng lab thật. Học hiệu quả hơn với AI hỗ trợ từng bước.
          </p>

          {/* Feature pills */}
          <div className={styles.featurePills}>
            {PILLS.map((label) => (
              <div className={styles.pill} key={label}>
                <span className={styles.pillDot} />
                {label}
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className={styles.statsRow}>
            {STATS.map((s, i) =>
              s === null ? (
                <div key={i} className={styles.statDivider} />
              ) : (
                <div key={i} className={styles.stat}>
                  <div className={styles.statNum}>{s.num}</div>
                  <div className={styles.statLabel}>{s.label}</div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Right panel — login card */}
        <div className={styles.rightPanel}>
          <div className={styles.loginCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Bắt đầu học tập</div>
              <div className={styles.cardDesc}>
                Đăng nhập để vào phòng thí nghiệm số của bạn
              </div>
            </div>

            <div className={styles.divider}>
              <div className={styles.dividerLine} />
              <span className={styles.dividerText}>Tiếp tục với Google</span>
              <div className={styles.dividerLine} />
            </div>

            <div className={styles.main}>
              <GoogleOAuthProvider
                clientId={APP_CONFIG_GOOGLE_CLIENT_ID || 'dummy-client-id.apps.googleusercontent.com'}
              >
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => message.error('Đăng nhập Google thất bại')}
                />
              </GoogleOAuthProvider>
            </div>

            <div className={styles.note}>
              Bằng cách đăng nhập, bạn đồng ý với{' '}
              <a href="#">Điều khoản sử dụng</a> và{' '}
              <a href="#">Chính sách bảo mật</a> của chúng tôi.
            </div>
          </div>
        </div>
      </div>

      <div className={styles.loginFooter}>
        <Footer />
      </div>
    </div>
  );
};

export default Login;
