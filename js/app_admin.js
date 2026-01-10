// Simple tab switching (moved from admin.html)
document.querySelectorAll('#nav-desktop-adm li a').forEach(function(a){
  a.addEventListener('click', function(e){
    e.preventDefault();
    var target = this.getAttribute('href').substring(1);
    document.querySelectorAll('.tab-content').forEach(function(c){ c.style.display = 'none'; });
    var el = document.getElementById(target);
    if(el) el.style.display = '';
    document.querySelectorAll('#nav-desktop-adm li').forEach(function(li){ li.classList.remove('active'); });
    this.parentElement.classList.add('active');
    document.getElementById('title_nav').textContent = this.textContent;
  });
});
