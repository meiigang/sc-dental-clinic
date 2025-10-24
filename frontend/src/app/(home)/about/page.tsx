import Image from "next/image";

export default function About() {
  return (
    <main className="bg-blue-light">
      {/* About the Clinic */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 max-w-6xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-blue-dark">
          About the Clinic
        </h2>
        <p className="mt-4 text-sm sm:text-base md:text-lg text-black max-w-2xl mx-auto">
          Cuaton Dental Clinic is a trusted dental care provider conveniently located in the heart of the Buhangin District, Davao City.
          Established in 2010, the clinic has been dedicated to delivering high-quality dental services for over a decade.
        </p>

        <div className="mt-8 flex justify-center gap-4 sm:gap-6 flex-wrap">
          {[1].map((_, index) => (
            <div
              key={index}
              className="bg-blue-100 rounded-xl w-160 h-auto flex items-center justify-center overflow-hidden shadow-lg"
            >
              <Image
                src="/images/about-section1.jpg"
                alt="Clinic"
                width={240}
                height={160}
                className="object-cover w-full h-full"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Meet the Dentist */}
      <section className="bg-white py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-blue-dark">
            Meet the Dentist
          </h2>
          <div className="mt-8 flex flex-col md:flex-row items-center md:items-start md:justify-center gap-8">
            <div className="bg-blue-100 rounded-xl w-48 h-48 overflow-hidden shadow-lg">
              <Image
                src="/images/home-section1-portrait.jpg"
                alt="Clinic"
                width={240}
                height={160}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="max-w-md text-sm sm:text-base md:text-lg text-black text-left md:text-start">
              <p className="mb-4">
                [This text is a placeholder. Here will be the information about the dentist, primarily her educational background and professional experience.]
              </p>
              <p>
                [Included also in this portion are her personal socials.]
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Us */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-blue-dark">
          Contact Us
        </h2>
        <div className="mt-8 max-w-md mx-auto text-sm sm:text-base md:text-lg space-y-4 text-left">
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <strong className="text-[var(--blue-primary)]">GMAIL</strong>
            <a
              href="mailto:sabadocuatondentalclinic@gmail.com"
              className="text-gray-700 hover:underline"
            >
              sabadocuatondentalclinic@gmail.com
            </a>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <strong className="text-[var(--blue-primary)]">FACEBOOK</strong>
            <a
              href="https://www.facebook.com/SabadoCuatonDentalClinic"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:underline"
            >
              Sabado-Cuaton Dental Clinic
            </a>
          </div>
          <div className="flex justify-between">
            <strong className="text-[var(--blue-primary)]">PHONE</strong>
            <a
              href="tel:09421551053"
              className="text-gray-700 hover:underline"
            >
              0942 155 1053
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
