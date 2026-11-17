// ===== Dane =====
// bills    – lista rachunków: [{ id, name }]
// payments – zapłacone rachunki w danym miesiącu: { '2026-11': { id: 'data zapłaty' } }

let bills = JSON.parse(localStorage.getItem('bills')) || []
let payments = JSON.parse(localStorage.getItem('payments')) || {}

// Klucz bieżącego miesiąca, np. '2026-11'
// Dzięki temu w nowym miesiącu wszystkie rachunki są znowu niezapłacone
const now = new Date()
const monthKey = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0')

if (!payments[monthKey]) payments[monthKey] = {}

function save() {
	localStorage.setItem('bills', JSON.stringify(bills))
	localStorage.setItem('payments', JSON.stringify(payments))
}

// ===== Wyświetlanie =====
const list = document.getElementById('bill-list')
const empty = document.getElementById('empty')

document.getElementById('month').textContent = now.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })

function render() {
	list.innerHTML = ''
	empty.hidden = bills.length > 0

	bills.forEach(bill => {
		const paidDate = payments[monthKey][bill.id]

		const li = document.createElement('li')
		li.className = paidDate ? 'bill paid' : 'bill'

		const checkbox = document.createElement('input')
		checkbox.type = 'checkbox'
		checkbox.id = 'bill-' + bill.id
		checkbox.checked = Boolean(paidDate)
		checkbox.addEventListener('change', () => togglePaid(bill.id))

		const info = document.createElement('label')
		info.className = 'bill-info'
		info.htmlFor = checkbox.id

		const name = document.createElement('span')
		name.className = 'bill-name'
		name.textContent = bill.name
		info.appendChild(name)

		if (paidDate) {
			const date = document.createElement('span')
			date.className = 'bill-date'
			date.textContent = 'Zapłacono: ' + new Date(paidDate).toLocaleDateString('pl-PL')
			info.appendChild(date)
		}

		const del = document.createElement('button')
		del.className = 'delete-btn'
		del.textContent = 'Usuń'
		del.addEventListener('click', () => deleteBill(bill.id))

		li.append(checkbox, info, del)
		list.appendChild(li)
	})
}

// ===== Akcje =====
document.getElementById('add-form').addEventListener('submit', event => {
	event.preventDefault()
	const input = document.getElementById('bill-name')
	const name = input.value.trim()
	if (!name) return

	bills.push({ id: Date.now(), name: name })
	save()
	render()
	input.value = ''
})

function togglePaid(id) {
	if (payments[monthKey][id]) {
		delete payments[monthKey][id]
	} else {
		payments[monthKey][id] = new Date().toISOString()
	}
	save()
	render()
}

function deleteBill(id) {
	const bill = bills.find(b => b.id === id)
	if (!confirm('Usunąć rachunek "' + bill.name + '"?')) return

	bills = bills.filter(b => b.id !== id)
	delete payments[monthKey][id]
	save()
	render()
}

render()

// ===== Service Worker =====
if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('./sw.js')
		.then(reg => console.log('Service Worker zarejestrowany', reg))
		.catch(err => console.error('Błąd rejestracji Service Workera', err))
}
