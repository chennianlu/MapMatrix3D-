import React, { useState, useEffect, useRef } from 'react';
import { getCode, reqCheck } from '../../service/api/user';
import { Modal, message } from 'antd';
import './style.css';
import CryptoJS from 'crypto-js';

/**
 * @word 要加密的内容
 * @keyWord String  服务器随机返回的关键字
 *  */
export function aesEncrypt(word: string, keyWord = 'XwKsGlMcdPMEhR1B') {
  const key = CryptoJS.enc.Utf8.parse(keyWord)
  const srcs = CryptoJS.enc.Utf8.parse(word)
  const encrypted = CryptoJS.AES.encrypt(srcs, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  })
  return encrypted.toString()
}


interface CaptchaResponse {
  repCode: string;
  repMsg: string;
  repData: {
    originalImageBase64: string;
    jigsawImageBase64: string;
    token: string;
    secretKey?: string;
  };
}

interface SlideCaptchaProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (token: string) => void;
  onFail: () => void;
  captchaType?: string;
  mode?: 'pop' | 'embed';
  imgSize?: {
    width: string;
    height: string;
  };
  blockSize?: {
    width: string;
    height: string;
  };
}

const SlideCaptcha: React.FC<SlideCaptchaProps> = ({
  visible,
  onClose,
  onSuccess,
  onFail,
  captchaType = 'blockPuzzle',
  mode = 'pop',
  imgSize = { width: '400px', height: '200px' },
  blockSize = { width: '50px', height: '50px' }
}) => {
  const [loading, setLoading] = useState(false);
  const [moveBlockLeft, setMoveBlockLeft] = useState<string>('0px');
  const [leftBarWidth, setLeftBarWidth] = useState<string | undefined>(undefined);
  const [isDragging, setIsDragging] = useState(false);
  const [captchaImages, setCaptchaImages] = useState<{
    originalImage: string;
    sliderImage: string;
  } | null>(null);
  const [captchaToken, setCaptchaToken] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [passFlag, setPassFlag] = useState(false);
  const [showRefresh, setShowRefresh] = useState(true);
  const [startMoveTime, setStartMoveTime] = useState(0);
  const [endMoveTime, setEndMoveTime] = useState(0);
  const [isEnd, setIsEnd] = useState(false);
  const [startLeft, setStartLeft] = useState(0);
  const [moveBlockBackgroundColor, setMoveBlockBackgroundColor] = useState('#fff');
  const [leftBarBorderColor, setLeftBarBorderColor] = useState('#ddd');
  const [iconColor, setIconColor] = useState('#000');
  const [iconClass, setIconClass] = useState('→');
  const [transitionLeft, setTransitionLeft] = useState('');
  const [transitionWidth, setTransitionWidth] = useState('');
  const [text, setText] = useState('向右滑动完成验证');

  const sliderRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const barAreaRef = useRef<HTMLDivElement>(null);
  const currentLeftRef = useRef<number>(0);

  useEffect(() => {
    if (visible) {
      fetchCaptcha();
    }
  }, [visible]);

  const fetchCaptcha = async () => {
    try {
      setLoading(true);
      const data: any = await getCode({ captchaType });
      if (data.repCode === '0000') {
        setCaptchaImages({
          originalImage: data.repData.originalImageBase64,
          sliderImage: data.repData.jigsawImageBase64
        });
        setCaptchaToken(data.repData.token);
        setSecretKey(data.repData.secretKey || '');
      }
    } catch (error) {
      console.error('获取验证码失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (loading || isEnd) return;
    
    const x = 'touches' in e ? e.touches[0].pageX : e.clientX;
    if (barAreaRef.current) {
      const barAreaLeft = barAreaRef.current.getBoundingClientRect().left;
      const startPosition = Math.floor(x - barAreaLeft);
      console.log('开始位置:', {
        mouseX: x,
        barAreaLeft,
        startPosition
      });
      setStartLeft(startPosition);
      currentLeftRef.current = 0;
      setMoveBlockLeft('0px');
      setLeftBarWidth('0px');
    }
    setStartMoveTime(Date.now());
    setText('');
    setMoveBlockBackgroundColor('#337ab7');
    setLeftBarBorderColor('#337AB7');
    setIconColor('#fff');
    setIsDragging(true);
    e.stopPropagation();
  };

  const handleMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || isEnd || !barAreaRef.current) return;

    const x = 'touches' in e ? e.touches[0].pageX : e.clientX;
    const barAreaLeft = barAreaRef.current.getBoundingClientRect().left;
    const currentX = x - barAreaLeft;
    const moveDistance = currentX - startLeft;

    // 限制滑块移动范围
    const maxLeft = barAreaRef.current.offsetWidth - parseInt(blockSize.width);
    const limitedDistance = Math.max(0, Math.min(moveDistance, maxLeft));

    console.log('移动中:', {
      mouseX: x,
      barAreaLeft,
      currentX,
      startLeft,
      moveDistance,
      maxLeft,
      limitedDistance
    });

    currentLeftRef.current = limitedDistance;
    setMoveBlockLeft(`${limitedDistance}px`);
    setLeftBarWidth(`${limitedDistance}px`);
  };

  const handleEnd = async () => {
    if (!isDragging || isEnd) return;
    
    setEndMoveTime(Date.now());
    setIsDragging(false);
    
    // 使用 ref 中的最新值
    const moveLeftDistance = currentLeftRef.current;
    console.log('当前滑块位置:', moveLeftDistance);
    
    // 修改计算方式：直接使用 (moveLeftDistance * 310) / imgWidth
    const normalizedDistance = Math.round((moveLeftDistance * 310) / parseInt(imgSize.width));
    
    console.log('结束位置:', {
      moveLeftDistance,
      normalizedDistance,
      imgSize: imgSize.width,
      blockSize: blockSize.width,
      calculation: {
        ratio: moveLeftDistance / parseInt(imgSize.width),
        final: (moveLeftDistance * 310) / parseInt(imgSize.width)
      }
    });

    // 准备验证数据
    const data = {
      captchaType,
      pointJson: secretKey
        ? aesEncrypt(JSON.stringify({ x: normalizedDistance, y: 5.0 }), secretKey)
        : JSON.stringify({ x: normalizedDistance, y: 5.0 }),
      token: captchaToken
    };

    try {
      const res: any = await reqCheck(data);
      if (res.repCode === '0000') {
        setMoveBlockBackgroundColor('#5cb85c');
        setLeftBarBorderColor('#5cb85c');
        setIconColor('#fff');
        setIconClass('✓');
        setShowRefresh(false);
        setIsEnd(true);
        setPassFlag(true);
        
        const timeSpent = ((Date.now() - startMoveTime) / 1000).toFixed(2);
        message.success(`${timeSpent}s 验证成功`);
        
        // 生成验证信息
        const captchaVerification = secretKey
          ? aesEncrypt(
              `${captchaToken}---${JSON.stringify({ x: normalizedDistance, y: 5.0 })}`,
              secretKey
            )
          : `${captchaToken}---${JSON.stringify({ x: normalizedDistance, y: 5.0 })}`;
        
        setTimeout(() => {
          onSuccess(captchaVerification);
        }, 1000);
      } else {
        setMoveBlockBackgroundColor('#d9534f');
        setLeftBarBorderColor('#d9534f');
        setIconColor('#fff');
        setIconClass('✕');
        setPassFlag(false);
        message.error('验证失败');
        onFail();
        
        setTimeout(() => {
          refresh();
        }, 1000);
      }
    } catch (error) {
      console.error('验证失败:', error);
      setMoveBlockBackgroundColor('#d9534f');
      setLeftBarBorderColor('#d9534f');
      setIconColor('#fff');
      setIconClass('✕');
      setPassFlag(false);
      message.error('验证失败');
      onFail();
      
      setTimeout(() => {
        refresh();
      }, 1000);
    }
  };

  const refresh = async () => {
    setShowRefresh(true);
    setTransitionLeft('left .3s');
    setMoveBlockLeft('0px');
    setLeftBarWidth(undefined);
    setTransitionWidth('width .3s');
    setLeftBarBorderColor('#ddd');
    setMoveBlockBackgroundColor('#fff');
    setIconColor('#000');
    setIconClass('→');
    setIsEnd(false);
    
    await fetchCaptcha();
    
    setTimeout(() => {
      setTransitionWidth('');
      setTransitionLeft('');
      setText('向右滑动完成验证');
    }, 300);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('touchmove', handleMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchend', handleEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, isEnd]);

  const content = (
    <div className="slide-captcha-container">
      <div className="captcha-image-container" ref={containerRef}>
        {loading ? (
          <div className="slide-captcha-loading">加载中...</div>
        ) : captchaImages ? (
          <>
            <img 
              src={`data:image/png;base64,${captchaImages.originalImage}`} 
              alt="验证码背景" 
              className="original-image"
              style={{ width: imgSize.width, height: imgSize.height }}
            />
            {showRefresh && (
              <div className="verify-refresh" onClick={refresh}>
                <i className="icon-refresh">↻</i>
              </div>
            )}
          </>
        ) : (
          <div className="slide-captcha-loading">加载失败，请重试</div>
        )}
      </div>
      <div 
        className="slider-container"
        ref={barAreaRef}
      >
        <div 
          className="slider"
          style={{
            left: moveBlockLeft,
            backgroundColor: moveBlockBackgroundColor,
            transition: transitionLeft
          }}
          onMouseDown={handleStart}
          onTouchStart={handleStart}
        >
          <span className="slider-icon" style={{ color: iconColor }}>
            {iconClass}
          </span>
          <div 
            className="slider-image"
            style={{
              width: `${Math.floor((parseInt(imgSize.width) * 47) / 310)}px`,
              height: imgSize.height,
              position: 'absolute',
              top: `-${parseInt(imgSize.height)+16}px`,
              left: '0',
              backgroundSize: `${imgSize.width} ${imgSize.height}`,
              zIndex: 2
            }}
          >
            {captchaImages && (
              <img 
                src={`data:image/png;base64,${captchaImages.sliderImage}`} 
                alt="验证码滑块" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  userSelect: 'none',
                  display: 'block'
                }}
              />
            )}
          </div>
        </div>
        <div className="slider-track">
          <span className="slider-text">
            {text}
          </span>
        </div>
      </div>
    </div>
  );

  if (mode === 'embed') {
    return content;
  }

  return (
    <Modal
      title="安全验证"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={464}
      centered={true}
      maskClosable={false}
      className="slide-captcha-modal"
      style={{ top: 0 }}
    >
      {content}
    </Modal>
  );
};

// 创建一个高阶组件来包装 SlideCaptcha
export const withSlideCaptcha = (WrappedComponent: React.ComponentType<any>) => {
  return (props: any) => {
    const [captchaVisible, setCaptchaVisible] = useState(false);
    const [captchaToken, setCaptchaToken] = useState('');

    const handleCaptchaSuccess = (token: string) => {
      setCaptchaToken(token);
      setCaptchaVisible(false);
      // 这里可以触发登录逻辑
      if (props.onLogin) {
        props.onLogin(token);
      }
    };

    return (
      <>
        <WrappedComponent {...props} onShowCaptcha={() => setCaptchaVisible(true)} />
        <SlideCaptcha
          visible={captchaVisible}
          onClose={() => setCaptchaVisible(false)}
          onSuccess={handleCaptchaSuccess}
          onFail={() => setCaptchaVisible(false)}
        />
      </>
    );
  };
};

export default SlideCaptcha; 