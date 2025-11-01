import axios from 'axios';
import { PINATA_CONFIG } from '@config';

class PinataService {
  constructor() {
    this.apiKey = PINATA_CONFIG.apiKey;
    this.secretKey = PINATA_CONFIG.secretKey;
    this.jwt = PINATA_CONFIG.jwt;
    this.gateway = PINATA_CONFIG.gateway;
    this.baseURL = 'https://api.pinata.cloud';
  }

  /**
   * Upload file to IPFS via Pinata
   * @param {File} file - File to upload
   * @param {Object} metadata - Optional metadata
   * @returns {Promise<{ipfsHash: string, url: string}>}
   */
  async uploadFile(file, metadata = {}) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Add metadata
      const pinataMetadata = JSON.stringify({
        name: metadata.name || file.name,
        keyvalues: {
          type: metadata.type || 'profile_picture',
          uploadedAt: new Date().toISOString(),
          ...metadata.custom,
        },
      });
      formData.append('pinataMetadata', pinataMetadata);

      // Add options
      const pinataOptions = JSON.stringify({
        cidVersion: 1,
      });
      formData.append('pinataOptions', pinataOptions);

      const headers = {
        'Content-Type': 'multipart/form-data',
      };

      // Try JWT first, fallback to API key/secret
      if (this.jwt) {
        headers['Authorization'] = `Bearer ${this.jwt}`;
      } else if (this.apiKey && this.secretKey) {
        headers['pinata_api_key'] = this.apiKey;
        headers['pinata_secret_api_key'] = this.secretKey;
      }

      const response = await axios.post(
        `${this.baseURL}/pinning/pinFileToIPFS`,
        formData,
        {
          headers,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );

      const ipfsHash = response.data.IpfsHash;
      const url = `${this.gateway}${ipfsHash}`;

      return {
        ipfsHash,
        url,
        success: true,
      };
    } catch (error) {
      console.error('Pinata upload error:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      console.error('JWT being used:', this.jwt ? this.jwt.substring(0, 50) + '...' : 'No JWT found');
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to upload to IPFS');
    }
  }

  /**
   * Upload JSON data to IPFS
   * @param {Object} data - JSON data to upload
   * @param {string} name - Name for the JSON file
   * @returns {Promise<{ipfsHash: string, url: string}>}
   */
  async uploadJSON(data, name = 'data.json') {
    try {
      const response = await axios.post(
        `${this.baseURL}/pinning/pinJSONToIPFS`,
        {
          pinataContent: data,
          pinataMetadata: {
            name: name,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.jwt}`,
          },
        }
      );

      const ipfsHash = response.data.IpfsHash;
      const url = `${this.gateway}${ipfsHash}`;

      return {
        ipfsHash,
        url,
        success: true,
      };
    } catch (error) {
      console.error('Pinata JSON upload error:', error);
      throw new Error(error.response?.data?.error || 'Failed to upload JSON to IPFS');
    }
  }

  /**
   * Get file from IPFS
   * @param {string} ipfsHash - IPFS hash
   * @returns {string} Full URL to the file
   */
  getFileUrl(ipfsHash) {
    return `${this.gateway}${ipfsHash}`;
  }

  /**
   * Validate image file
   * @param {File} file - File to validate
   * @param {number} maxSizeMB - Maximum size in MB
   * @returns {{isValid: boolean, error: string|null}}
   */
  validateImageFile(file, maxSizeMB = 5) {
    if (!file) {
      return { isValid: false, error: 'No file provided' };
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Invalid file type. Please upload JPEG, PNG, GIF, or WebP image.',
      };
    }

    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File size must be less than ${maxSizeMB}MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
      };
    }

    return { isValid: true, error: null };
  }

  /**
   * Compress and resize image before upload
   * @param {File} file - Image file
   * @param {number} maxWidth - Maximum width
   * @param {number} quality - Image quality (0-1)
   * @returns {Promise<Blob>}
   */
  async compressImage(file, maxWidth = 800, quality = 0.85) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              resolve(blob);
            },
            file.type,
            quality
          );
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  }

  /**
   * Check if Pinata is configured
   * @returns {boolean}
   */
  isConfigured() {
    return !!(this.jwt && !this.jwt.includes('your_'));
  }
}

export default new PinataService();
