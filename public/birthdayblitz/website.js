const demo = document.querySelector('#birthday-demo');
const message = document.querySelector('#demo-message');
demo.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = demo.elements.person.value.trim();
  if (!name) {
    demo.elements.person.setCustomValidity('Enter a name to try the demo.');
    demo.elements.person.reportValidity();
    return;
  }
  const date = new Date(`${demo.elements.birthday.value}T12:00:00`);
  const formatted = new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric' }).format(date);
  message.textContent = `Preview: ${name}’s Birthday on ${formatted}. Install Birthday Blitz to save it to Google Calendar.`;
});
demo.addEventListener('input', () => {
  demo.elements.person.setCustomValidity('');
  message.textContent = 'Just a demo. Nothing is saved to your calendar.';
});
