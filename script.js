
const scroller = scrollama();

function generateCashImages() {
  const cashContainer = document.querySelector('#cash-scroll-container');
  cashContainer.innerHTML = '';
  
  const cashTypes = ['Cash_1.png', 'Cash_2.png', 'Cash_3.png', 'Cash_4.png'];

  const isMobile = window.innerWidth <= 400;
  const imagesPerRow = isMobile ? 4 : 10;
  const totalImages = 900;
  const numRows = Math.ceil(totalImages / imagesPerRow);

  let imageIndex = 0;

  for (let row = 0; row < numRows; row++) {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'cash-row';

      for (let col = 0; col < imagesPerRow && imageIndex < totalImages; col++) {
          const cashType = cashTypes[imageIndex % cashTypes.length];
          const img = document.createElement('img');
          img.src = `Illustrations/${cashType}`;
          img.alt = 'Bolivar';
          img.style.width = isMobile ? '80px' : '80px';
          rowDiv.appendChild(img);
          imageIndex++;
      }

      cashContainer.appendChild(rowDiv);
  }
}

window.addEventListener('resize', () => {
  generateCashImages();
});

scroller
    .setup({
        step: ".step",
        offset: 0.5,
        debug: false
    })
    .onStepEnter(response => {
        const step = response.element.getAttribute("data-step");
        const cashContainer = document.querySelector('#cash-scroll-container');
        const cashWrapper = document.querySelector('#cash-wrapper');

        if (step === "1") {
            cashWrapper.style.display = 'flex';
            // cashContainer.style.display = 'none';
            document.querySelector("#bolivar-image").src = "Illustrations/Cash_1.png";
            document.querySelector("#extra-cash").innerHTML = "";
            cashWrapper.style.opacity = 1;

        }

        if (step === "2") {
            cashWrapper.style.display = 'flex';
            // cashContainer.style.display = 'none';
            document.querySelector("#bolivar-image").src = "Illustrations/Cash_1.png";
            document.querySelector("#extra-cash").innerHTML = `
                <img src="Illustrations/Cash_2.png" />
                <img src="Illustrations/Cash_3.png" />
                <img src="Illustrations/Cash_4.png" />
            `;
            cashWrapper.style.opacity = 1;

        }

        if (step === "3") {
            
            // Hide the initial cash display
            cashWrapper.style.opacity = 0;
            // cashContainer.style.display = 'flex';
        }
    });
    
generateCashImages();


const profileScroller = scrollama();

profileScroller
  .setup({
    step: "#profile-scrolly .step",
    offset: 0.5,
    debug: false
  })
  .onStepEnter(response => {
    const { element } = response;
    const role = element.getAttribute("data-role");
    const index = element.getAttribute("data-index");

    const isFinalStep = role === "minimum" && index === "4";

    if (isFinalStep) {
        // Add 'active' and show labels
        document.querySelectorAll(".profile").forEach(profile => {
          profile.classList.add("active");
          profile.querySelector(".label").style.display = "block";
        });
      
        document.querySelector(".salary-profiles").classList.add("final");
      
        // Fade out last scrolly text — delay this slightly
        setTimeout(() => {
          element.style.opacity = "0";
        }, 300); // Delay 300ms to allow scrollama to register the step properly
      

      // Fade out final scrolly text
      element.style.opacity = "0";
    } else {
      // Reset layout
      document.querySelector(".salary-profiles").classList.remove("final");

      // Restore visibility of all steps
      document.querySelectorAll("#profile-scrolly .step").forEach(step => {
        step.style.opacity = "1";
      });

      // Update profiles
      document.querySelectorAll(".profile").forEach(profile => {
        const profileRole = profile.getAttribute("data-role");
        const img = profile.querySelector("img");

        // Always hide all labels
        profile.querySelector(".label").style.display = "none";

        if (profileRole === role) {
          profile.classList.add("active");
          img.src = `Illustrations/profiles/${role}_${index}.png`;
        } else {
          profile.classList.remove("active");
        }
      });
    }
  });


  document.getElementById("salary-select").addEventListener("change", function () {
    const storeSection = document.getElementById("online-store");

    // Delay if needed (e.g., 300ms)
    setTimeout(() => {
        storeSection.scrollIntoView({ behavior: "smooth" });
    }, 400);
});

