/* CLOSE FLASH MESSAGE */
$(document).ready(function() {
	$('.top-message').delay(3000).fadeOut(1000)
})

/* MODAL */
function openModal() {
    $('body').addClass('toggled')
    $('.modal-wrapper').fadeIn().addClass('toggled')
}

function closeModal() {
    $('body').removeClass('toggled')
    $('.modal-wrapper').fadeOut().removeClass('toggled')
}

$('.modal-close').click(function() {
    closeModal()
})