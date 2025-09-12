const initializeSlider = (sliderElement) => {
    const slidesContainer = sliderElement.querySelector('.slider-js__slides');
    const slides = sliderElement.querySelectorAll('.slider-js__slide');
    const prevButton = sliderElement.querySelector('.slider-js__btn--prev');
    const nextButton = sliderElement.querySelector('.slider-js__btn--next');
    const dotsContainer = sliderElement.querySelector('.slider-js__dots');

    let currentIndex = 0;
    const totalSlides = slides.length;

    let autoPlayInterval; // Variável para guardar o timer do autoplay
    const autoPlayTime = 4050; // Tempo em milissegundos (4.05 segundos)

    // Função que inicia (ou reinicia) o timer do autoplay
    const startAutoplay = () => {
        // Limpa qualquer timer anterior para evitar múltiplos timers rodando
        clearInterval(autoPlayInterval);
        
        autoPlayInterval = setInterval(() => {
            // Avança para o próximo slide
            goToSlide(currentIndex + 1);
        }, autoPlayTime);
    };
    // ----------------------------


    // Garante que o slider tenha conteúdo antes de continuar
    if (!slidesContainer || slides.length === 0) {
        console.error("Slider não pôde ser iniciado por falta de elementos:", sliderElement);
        return;
    }

    dotsContainer.innerHTML = '';

    slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.classList.add('slider-js__dot');
        dot.addEventListener('click', () => {
            goToSlide(i);
        });
        dotsContainer.appendChild(dot);
    });

    const dots = sliderElement.querySelectorAll('.slider-js__dot');

    const goToSlide = (slideIndex) => {
        currentIndex = (slideIndex + totalSlides) % totalSlides;

        slidesContainer.style.transform = `translateX(-${currentIndex * 100}%)`;

       
        dots.forEach((dot, i) => {
            dot.classList.toggle('slider-js__dot--active', i === currentIndex);
        });

        startAutoplay();
    };

    // --- EVENTOS DOS BOTÕES ---
    nextButton.addEventListener('click', () => {
        goToSlide(currentIndex + 1);
    });

    prevButton.addEventListener('click', () => {
        goToSlide(currentIndex - 1);
    });

    // --- INICIALIZAÇÃO DO SLIDER ---
    goToSlide(0); // Mostra o primeiro slide e inicia o autoplay pela primeira vez
};

// --- INICIA TODOS OS SLIDERS DA PÁGINA ---
document.addEventListener('DOMContentLoaded', () => {
    const allSliders = document.querySelectorAll('.slider-js');
    allSliders.forEach(slider => {
        initializeSlider(slider);
    });
});