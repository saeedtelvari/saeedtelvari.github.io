cell = document.querySelectorAll('td');
for (var i = 0; i < cell.length; i++) {
    console.log(i)
    cell[i].addEventListener('click', function() {
        if (this.textContent === '') {
            this.textContent = 'X';
            this.style.fontsize = '7rem';
        } else if (this.textContent === 'X') {
            this.textContent = 'O';
            this.style.fontsize = '7rem';
        } else if (this.textContent === 'O') {
            this.textContent = '';
            this.style.fontsize = '7rem';
        }


    })

};