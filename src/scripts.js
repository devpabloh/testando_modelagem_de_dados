document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const response = await fetch('/api/contato', {
        method: 'POST',
        body: formData
      });
      const result = await response.json();
      alert(result.message);
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar os dados.');
    }
  });