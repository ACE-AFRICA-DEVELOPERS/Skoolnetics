let navSlide = () => {
    let navbarToggler = document.querySelector('.navbar-toggler') //navbar toggler button
let mobileNavbar = document.querySelector('.mobile-nav') //Mobile nav menu
// let navCol = document.querySelector('.nav-col')
let close = document.querySelector('.close') //close button on the mobile navbar menu

navbarToggler.addEventListener('click' , event => {
    mobileNavbar.style.display="block";

    // //Toggle Button
    // mobileNavbar.classList.toggle('nav-active')

    // //Animation
    // navCol.forEach((link, index) => {
    //     if(link.style.animation) {
    //         link.style.animation = ""
    //     }
    //     else {
    //         link.style.animation = `navLinkFade 0.5s ease forwards ${index / 5}s`
    //     }
    // }) 
})

close.addEventListener('click' , event => {
    mobileNavbar.style.display="none" ;
})
}
navSlide()
new WOW().init();


!(function($) {
  // Testimonial carousel (uses the Owl Carousel library)
  $('.owl-client').owlCarousel({
    animateOut: 'fadeOut',
    dots : true ,
    loop: true,
    autoplayHoverPause: false,
    autoplay: true,
    smartSpeed: 1000,
    responsiveClass: true,
    responsive: {
      0: {
        items: 1,
      },
      767 : {
        items : 2,
      } ,
      992: {
          items : 3,
      }
    }
  });



  // Back to top button
  $(window).scroll(function() {
    if ($(this).scrollTop() > 100) {
      $('.back-to-top').fadeIn('slow'); 
    } else {
      $('.back-to-top').fadeOut('slow');
    }
  });

  $('.back-to-top').click(function() {
    $('html, body').animate({
      scrollTop: 0
    }, 1500, 'easeInOutExpo');
    return false;
  });
  


})(jQuery);





