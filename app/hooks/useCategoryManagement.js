'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api-helpers';
import toast from 'react-hot-toast';

export default function useCategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // สถานะสำหรับการจัดการฟอร์ม
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', slug: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  // สถานะสำหรับการลบหมวดหมู่
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchApi('/api/categories');
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('ไม่สามารถดึงข้อมูลหมวดหมู่ได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^\w\sก-๙]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[ก-๙]+/g, (match) => encodeURIComponent(match))
      .replace(/-+/g, '-');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'name' && (!formData.slug || formData.slug === generateSlug(formData.name))) {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        slug: generateSlug(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'กรุณากรอกชื่อหมวดหมู่';
    }
    
    if (!formData.slug.trim()) {
      errors.slug = 'กรุณากรอก slug';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.slug = 'Slug ต้องประกอบด้วยตัวอักษรภาษาอังกฤษพิมพ์เล็ก ตัวเลข และเครื่องหมาย - เท่านั้น';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openAddForm = () => {
    setFormData({ name: '', slug: '' });
    setFormErrors({});
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const openEditForm = (category) => {
    setFormData({
      name: category.name,
      slug: category.slug
    });
    setFormErrors({});
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setFormData({ name: '', slug: '' });
    setFormErrors({});
    setEditingCategory(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      
      if (editingCategory) {
        const updatedCategory = await fetchApi(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
        
        setCategories(prev => 
          prev.map(cat => cat.id === updatedCategory.id ? updatedCategory : cat)
        );
      } else {
        const newCategory = await fetchApi('/api/categories', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        
        setCategories(prev => [...prev, newCategory]);
      }
      closeForm();
    } catch (err) {
      console.error('Error saving category:', err);
      
      // จัดการข้อผิดพลาดเฉพาะ
      if (err.message.includes('Slug นี้ถูกใช้งานแล้ว')) {
        setFormErrors(prev => ({ ...prev, slug: 'Slug นี้ถูกใช้งานแล้ว กรุณาเลือก slug อื่น' }));
      } else {
        toast.error(err.message || 'เกิดข้อผิดพลาดในการบันทึกหมวดหมู่');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteModal = (categoryId) => {
    setDeletingCategoryId(categoryId);
    setDeleteError(null);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeletingCategoryId(null);
    setDeleteError(null);
  };

  const handleDelete = async () => {
    if (!deletingCategoryId) {
      return;
    }
    
    try {
      setDeleteLoading(true);
      setDeleteError(null);
      
      await fetchApi(`/api/categories/${deletingCategoryId}`, {
        method: 'DELETE'
      });
      
      setCategories(prev => prev.filter(cat => cat.id !== deletingCategoryId));
      closeDeleteModal();
    } catch (err) {
      console.error('Error deleting category:', err);
      setDeleteError(err.message || 'เกิดข้อผิดพลาดในการลบหมวดหมู่');
    } finally {
      setDeleteLoading(false);
    }
  };

  return {
    categories,
    loading,
    error,
    fetchCategories,
    isFormOpen,
    formData,
    formErrors,
    submitting,
    editingCategory,
    handleFormChange,
    openAddForm,
    openEditForm,
    closeForm,
    handleSubmit,
    deleteModalOpen,
    deleteLoading,
    deleteError,
    openDeleteModal,
    closeDeleteModal,
    handleDelete
  };
}