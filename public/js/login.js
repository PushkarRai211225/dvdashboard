const form = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const phone = document.getElementById('phone').value;
  const password = document.getElementById('password').value;

  form.classList.add('loading');

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Store token
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    successMessage.textContent = 'Login successful! Redirecting...';
    successMessage.style.display = 'block';

    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 1500);
  } catch (error) {
    errorMessage.textContent = error.message;
    errorMessage.style.display = 'block';
    form.classList.remove('loading');
  }
});
