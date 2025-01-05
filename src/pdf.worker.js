// src/pdf.worker.js
import { GlobalWorkerOptions } from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.js';

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
