/**
 * DaydreamAPI - Integration with Daydream Live API
 * Handles stream creation, updates, and status checking
 */
class DaydreamAPI {
  constructor() {
    this.baseUrl = 'https://api.daydream.live/v1';
    this.corsProxies = [
      'https://api.allorigins.win/raw?url=',
      'https://corsproxy.io/?',
      'https://cors-anywhere.herokuapp.com/',
      'https://proxy.cors.sh/',
      'https://cors.bridged.cc/'
    ];
    this.currentProxyIndex = 0;
    this.useCorsProxy = false;
    this.apiKey = null;
    this.streamId = null;
    this.playbackId = null;
    this.whipUrl = null;
    this.peerConnection = null;
    this.canvasStream = null;
    
    // Default pipeline for StreamDiffusion
    this.defaultPipelineId = 'pip_qpUgXycjWF6YMeSL';
    
    // Auto-detect if we need CORS proxy
    this.detectCorsNeed();
  }

  /**
   * Detect if CORS proxy is needed based on environment
   */
  detectCorsNeed() {
    const isLocalhost = location.hostname === 'localhost' || 
                       location.hostname === '127.0.0.1' || 
                       location.hostname === '';
    const isHttp = location.protocol === 'http:';
    
    if (isLocalhost && isHttp) {
      console.warn('🚨 Development environment detected - CORS issues may occur');
      // Don't auto-enable CORS proxy, let user decide
    }
  }

  /**
   * Get the appropriate API URL (with or without CORS proxy)
   */
  getApiUrl() {
    if (!this.useCorsProxy) {
      return this.baseUrl;
    }
    
    const proxy = this.corsProxies[this.currentProxyIndex];
    return proxy + encodeURIComponent(this.baseUrl);
  }

  /**
   * Enable CORS proxy for development
   */
  enableCorsProxy() {
    this.useCorsProxy = true;
    this.currentProxyIndex = 0; // Start with first proxy
    console.log(`✅ CORS proxy enabled: ${this.corsProxies[this.currentProxyIndex]}`);
  }

  /**
   * Disable CORS proxy
   */
  disableCorsProxy() {
    this.useCorsProxy = false;
    console.log('✅ Direct API access enabled');
  }

  /**
   * Try next CORS proxy if current one fails
   */
  tryNextProxy() {
    if (this.currentProxyIndex < this.corsProxies.length - 1) {
      this.currentProxyIndex++;
      console.log(`🔄 Switching to proxy: ${this.corsProxies[this.currentProxyIndex]}`);
      return true;
    }
    return false;
  }

  /**
   * Reset to first proxy
   */
  resetProxy() {
    this.currentProxyIndex = 0;
  }

  /**
   * Set API key for authentication
   */
  setApiKey(apiKey) {
    this.apiKey = apiKey?.trim();
    return this.apiKey;
  }

  /**
   * Get authorization headers
   */
  getHeaders() {
    if (!this.apiKey) {
      throw new Error('API key not set');
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };
  }

  /**
   * Create a new stream using Daydream API
   */
  async createStream() {
    if (!this.apiKey) {
      throw new Error('API key is required');
    }

    // Reset proxy to first one for new requests
    if (this.useCorsProxy) {
      this.resetProxy();
    }

    return await this.attemptStreamCreation();
  }

  /**
   * Attempt stream creation with proxy fallback
   */
  async attemptStreamCreation(retryCount = 0) {
    try {
      console.log('Creating Daydream stream...');
      
      if (this.useCorsProxy) {
        console.log(`🔗 Using CORS proxy: ${this.corsProxies[this.currentProxyIndex]}`);
      }
      
      // Check if we're in development mode and suggest CORS solutions
      if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        console.warn('🚨 CORS Notice: Running on localhost may cause CORS issues.');
        console.log('💡 Solutions:');
        console.log('   1. Deploy to HTTPS hosting (recommended)');
        console.log('   2. Use CORS proxy for development');
        console.log('   3. Run Chrome with --disable-web-security flag');
      }
      
      const response = await fetch(`${this.getApiUrl()}/streams`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          pipeline_id: this.defaultPipelineId
        })
      });

      // Handle proxy-specific errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // If using proxy and got 403/429/502, try next proxy
        if (this.useCorsProxy && (response.status === 403 || response.status === 429 || response.status === 502)) {
          if (this.tryNextProxy()) {
            console.log(`⚠️ Proxy failed (${response.status}), trying next proxy...`);
            return await this.attemptStreamCreation(retryCount + 1);
          } else {
            throw new Error(`All CORS proxies failed. Last error: HTTP ${response.status}. Try deploying to HTTPS hosting instead.`);
          }
        }
        
        throw new Error(`HTTP ${response.status}: ${errorData.message || 'Failed to create stream'}`);
      }

      const data = await response.json();
      
      this.streamId = data.id;
      this.playbackId = data.output_playback_id;
      this.whipUrl = data.whip_url;

      console.log('Stream created successfully:', {
        streamId: this.streamId,
        playbackId: this.playbackId,
        proxy: this.useCorsProxy ? this.corsProxies[this.currentProxyIndex] : 'Direct'
      });

      return {
        streamId: this.streamId,
        playbackId: this.playbackId,
        whipUrl: this.whipUrl,
        data
      };
    } catch (error) {
      console.error('Failed to create stream:', error);
      
      // Handle network errors (CORS)
      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        // If using proxy and network failed, try next proxy
        if (this.useCorsProxy && retryCount < this.corsProxies.length - 1) {
          if (this.tryNextProxy()) {
            console.log(`🔄 Network error with proxy, trying next one...`);
            return await this.attemptStreamCreation(retryCount + 1);
          }
        }
        
        const corsError = new Error('CORS_ERROR');
        corsError.originalError = error;
        corsError.solutions = [
          'Deploy to HTTPS hosting (GitHub Pages, Netlify, Vercel)',
          'Try different CORS proxy (automatic retry attempted)',
          'Run Chrome with --disable-web-security --user-data-dir=/tmp/chrome_dev',
          'Use browser extension like CORS Unblock'
        ];
        throw corsError;
      }
      
      throw error;
    }
  }

  /**
   * Update stream parameters
   */
  async updateStream(params) {
    if (!this.streamId) {
      throw new Error('No active stream to update');
    }

    try {
      console.log('Updating stream parameters...');
      
      const updateData = {
        model_id: 'streamdiffusion',
        pipeline: 'live-video-to-video',
        params: {
          model_id: 'stabilityai/sd-turbo',
          prompt: params.prompt || 'vibrant flower blooming in space',
          negative_prompt: params.negativePrompt || 'blurry, low quality, distorted',
          num_inference_steps: params.steps || 20,
          seed: params.seed || 42,
          // T-list values should not exceed 50
          t_index_list: [0, 8, 17],
          controlnets: [
            {
              conditioning_scale: 0.22,
              enabled: true,
              model_id: 'thibaud/controlnet-sd21-openpose-diffusers',
              preprocessor: 'pose_tensorrt'
            },
            {
              conditioning_scale: 0.18,
              enabled: true,
              model_id: 'thibaud/controlnet-sd21-canny-diffusers',
              preprocessor: 'canny'
            }
          ],
          ...params.additionalParams
        }
      };

      const response = await fetch(`${this.getApiUrl()}/streams/${this.streamId}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.message || 'Failed to update stream'}`);
      }

      const data = await response.json();
      console.log('Stream updated successfully');
      return data;
    } catch (error) {
      console.error('Failed to update stream:', error);
      throw error;
    }
  }

  /**
   * Check stream status
   */
  async getStreamStatus() {
    if (!this.streamId) {
      throw new Error('No active stream');
    }

    try {
      const response = await fetch(`${this.getApiUrl()}/streams/${this.streamId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.message || 'Failed to get stream status'}`);
      }

      const data = await response.json();
      console.log('Stream status:', data.status);
      return data;
    } catch (error) {
      console.error('Failed to get stream status:', error);
      throw error;
    }
  }

  /**
   * Delete stream
   */
  async deleteStream() {
    if (!this.streamId) {
      throw new Error('No active stream to delete');
    }

    try {
      console.log('Deleting stream...');
      
      const response = await fetch(`${this.getApiUrl()}/streams/${this.streamId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.message || 'Failed to delete stream'}`);
      }

      console.log('Stream deleted successfully');
      
      // Clean up local state
      this.streamId = null;
      this.playbackId = null;
      this.whipUrl = null;
      
      // Stop WebRTC connection
      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }
      
      if (this.canvasStream) {
        this.canvasStream.getTracks().forEach(track => track.stop());
        this.canvasStream = null;
      }

      return true;
    } catch (error) {
      console.error('Failed to delete stream:', error);
      throw error;
    }
  }

  /**
   * Setup WebRTC connection for streaming canvas
   */
  async setupWebRTC(canvas) {
    if (!this.whipUrl) {
      throw new Error('WHIP URL not available');
    }

    try {
      console.log('Setting up WebRTC connection...');
      
      // Create canvas stream
      this.canvasStream = canvas.captureStream(30); // 30 FPS
      
      // Create peer connection
      this.peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      // Add error handling
      this.peerConnection.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', this.peerConnection.iceConnectionState);
      };

      this.peerConnection.onconnectionstatechange = () => {
        console.log('Connection state:', this.peerConnection.connectionState);
      };

      // Add canvas stream tracks to peer connection
      this.canvasStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.canvasStream);
        console.log('Added track:', track.kind);
      });

      // Create offer
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: false,
        offerToReceiveVideo: false
      });
      
      await this.peerConnection.setLocalDescription(offer);

      // Send offer to WHIP endpoint
      const response = await fetch(this.whipUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/sdp'
        },
        body: offer.sdp
      });

      if (!response.ok) {
        throw new Error(`WHIP connection failed: HTTP ${response.status}`);
      }

      // Set remote description with answer
      const answerSdp = await response.text();
      await this.peerConnection.setRemoteDescription({
        type: 'answer',
        sdp: answerSdp
      });

      console.log('WebRTC connection established successfully');
      return true;
    } catch (error) {
      console.error('WebRTC setup failed:', error);
      throw error;
    }
  }

  /**
   * Get playback URL for the stream
   */
  getPlaybackUrl() {
    if (!this.playbackId) {
      return null;
    }
    
    return `https://lvpr.tv/?v=${this.playbackId}&lowLatency=force`;
  }

  /**
   * Check if stream is active
   */
  isStreamActive() {
    return !!(this.streamId && this.playbackId);
  }

  /**
   * Get current stream info
   */
  getStreamInfo() {
    return {
      streamId: this.streamId,
      playbackId: this.playbackId,
      whipUrl: this.whipUrl,
      isActive: this.isStreamActive(),
      playbackUrl: this.getPlaybackUrl()
    };
  }

  /**
   * Cleanup all resources
   */
  cleanup() {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    
    if (this.canvasStream) {
      this.canvasStream.getTracks().forEach(track => track.stop());
      this.canvasStream = null;
    }
    
    this.streamId = null;
    this.playbackId = null;
    this.whipUrl = null;
  }
}

/**
 * Stream status checker utility
 */
class StreamStatusChecker {
  constructor(daydreamAPI) {
    this.api = daydreamAPI;
    this.intervalId = null;
    this.callbacks = [];
  }

  /**
   * Start periodic status checking
   */
  start(intervalMs = 10000) {
    this.stop(); // Stop any existing checker
    
    this.intervalId = setInterval(async () => {
      try {
        const status = await this.api.getStreamStatus();
        this.callbacks.forEach(callback => callback(status));
      } catch (error) {
        console.error('Status check failed:', error);
      }
    }, intervalMs);
  }

  /**
   * Stop status checking
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Add status change callback
   */
  onStatusChange(callback) {
    this.callbacks.push(callback);
  }

  /**
   * Remove status change callback
   */
  removeStatusChange(callback) {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }
}

// Export for use in main app
if (typeof window !== 'undefined') {
  window.DaydreamAPI = DaydreamAPI;
  window.StreamStatusChecker = StreamStatusChecker;
}