import { useState } from 'react';
import Modal from 'react-modal';

function Categories({ categories, onAddCategory }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', color: '#000000' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAddCategory(newCategory);
    setIsModalOpen(false);
    setNewCategory({ name: '', color: '#000000' });
  };

  return (
    <div className="categories-section">
      <div className="section-header">
        <h2>Categories</h2>
        <button className="add-button" onClick={() => setIsModalOpen(true)}>Add Category</button>
      </div>

      <table className="categories-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th>Color</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td style={{ backgroundColor: item.color }}>{item.color}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="modal"
        overlayClassName="overlay"
      >
        <h2>Add New Category</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Category Name:</label>
            <input
              type="text"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Color:</label>
            <input
              type="color"
              value={newCategory.color}
              onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
            />
          </div>
          <div className="button-group">
            <button type="submit">Add Category</button>
            <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Categories; 