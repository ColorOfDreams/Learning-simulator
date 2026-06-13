import Footer from '@/components/Footer';
import { Button } from 'antd';
import React from 'react';
import { history } from 'umi';
import styles from './index.less';

const Login: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        <div className={styles.leftPanel}>
          <img alt='logo' className={styles.logo} src='/logo-full.png' />
        </div>

        <div className={styles.rightPanel}>
          <div className={styles.loginCard}>
            <div className={styles.header}>
              <div className={styles.desc}>Đăng nhập Google đang tạm tắt trong bản demo</div>
            </div>

            <div className={styles.main}>
              <Button type='primary' block onClick={() => history.push('/ai-demo')}>
                Vào AI Demo
              </Button>
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
