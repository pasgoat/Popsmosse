document.addEventListener("DOMContentLoaded", () => {
  const typeCards = document.querySelectorAll('.question-type-card');
  const form = document.querySelector('.question-form');

  const renderForm = (type) => {
    form.innerHTML = '';

    if (type === 'quote') {
      form.innerHTML = `
        <textarea class="quote-textarea" placeholder="Enter your quote question..." rows="4"></textarea>
        <input type="text" placeholder="Possible answers" />
        <button type="submit">Add to Quiz</button>
      `;
    } else if (type === 'image') {
      form.innerHTML = `
        <div class="upload-box" id="drop-area">
            <input type="file" id="image-upload" class="image-upload" accept="image/*" />
            <label for="image-upload" class="upload-btn">📁 Upload Image</label>
            <p class="drop-text">or drag and drop an image here</p>
            <img id="image-preview" class="image-preview" style="display: none;" />
        </div>
        <input type="text" placeholder="Possible answers" />
        <button type="submit">Add to Quiz</button>
        `;

        const dropArea = form.querySelector('#drop-area');
        const imageInput = form.querySelector('#image-upload');
        const imagePreview = form.querySelector('#image-preview');

        const showPreview = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
        };

        // Handle input via file selection
        imageInput.addEventListener('change', () => {
            const file = imageInput.files[0];
            if (file) showPreview(file);
        });

        // Handle drag events
        ['dragenter', 'dragover'].forEach(event => {
            dropArea.addEventListener(event, (e) => {
            e.preventDefault();
            dropArea.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(event => {
            dropArea.addEventListener(event, (e) => {
            e.preventDefault();
            dropArea.classList.remove('dragover');
            });
        });

        // Handle dropped files
        dropArea.addEventListener('drop', (e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
            showPreview(file);
            }
        });
        }
  };

  // Default form on page load
  renderForm('quote');

  // Event listeners for toggle buttons
  typeCards.forEach(card => {
    card.addEventListener('click', () => {
      typeCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      renderForm(card.dataset.type);
    });
  });
});
