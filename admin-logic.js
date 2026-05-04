/**
 * jasa_web/shared/admin-logic.js
 * Logika CRUD untuk Admin Dashboard semua tema.
 * Requires: config.js (window.GAS_URL)
 * Exports:  window.ADMIN namespace
 */
(function () {
  'use strict';
  const ADMIN = (window.ADMIN = {});

  /* ── Helper: POST ke GAS ── */
  const post = (body) =>
    fetch(window.GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' }, // GAS butuh text/plain agar doPost bisa baca
      body: JSON.stringify(body),
    }).then((r) => r.json());

  /* ── Helper: GET dari GAS ── */
  const get = (params) =>
    fetch(`${window.GAS_URL}?${new URLSearchParams(params).toString()}`).then((r) => r.json());

  /* ── Ambil daftar semua sheet ── */
  ADMIN.fetchSheets = () => get({ type: 'sheets' });

  /* ── Ambil data lengkap (header + baris) satu sheet ── */
  ADMIN.fetchData = (sheet) => get({ type: 'data', sheet });

  /* ── Tambah baris baru ── */
  ADMIN.addRow = (sheet, data) => post({ action: 'add', sheet, data });

  /* ── Update baris berdasarkan rowIndex (nomor baris di spreadsheet) ── */
  ADMIN.updateRow = (sheet, rowIndex, data) => post({ action: 'update', sheet, rowIndex, data });

  /* ── Hapus baris ── */
  ADMIN.deleteRow = (sheet, rowIndex) => post({ action: 'delete', sheet, rowIndex });

  /* ── Update sheet Branding (key-value) ── */
  ADMIN.updateBranding = (data) => post({ action: 'update_branding', data });

  /**
   * Ambil data Branding sebagai key-value (untuk editor khusus Branding)
   */
  ADMIN.fetchBranding = () => get({ type: 'branding' });

  /**
   * buildFormFields(headers, values)
   * Mengembalikan array field config untuk di-render sebagai form dinamis.
   * headers: string[]  → nama kolom dari spreadsheet
   * values:  object    → { header: value } untuk mode edit (opsional)
   * Return:  [{ key, label, type, value }]
   */
  ADMIN.buildFormFields = function (headers, values = {}) {
    return headers.map((h) => {
      const key = h.trim();
      const label = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      const val = values[h] || '';
      // Deteksi otomatis tipe input berdasarkan nama kolom
      let type = 'text';
      if (/harga|price|biaya/.test(key.toLowerCase())) type = 'number';
      else if (/foto|image|img|url|link|logo/.test(key.toLowerCase())) type = 'url';
      else if (/deskripsi|desc|catatan|isi|jawaban|body/.test(key.toLowerCase())) type = 'textarea';
      else if (/stok/.test(key.toLowerCase())) type = 'select-stok';
      else if (/badge/.test(key.toLowerCase())) type = 'select-badge';
      return { key, label, type, value: val };
    });
  };

  /**
   * Kumpulkan nilai form dari DOM
   * formEl: HTMLFormElement
   * Return: object { kolom: nilai }
   */
  ADMIN.collectFormData = function (formEl) {
    const data = {};
    const inputs = formEl.querySelectorAll('[data-field]');
    inputs.forEach((el) => {
      data[el.dataset.field] = el.value;
    });
    return data;
  };

})();
