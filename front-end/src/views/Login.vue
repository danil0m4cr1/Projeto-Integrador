<template>
  <div class="h-[100vh] w-full flex flex-col lg:flex-row">
    <div class="w-full lg:w-1/2 bg-[#EFB11E] flex justify-center items-center lg:order-first p-20">
      <img
        src="/VJuice logo.png"
        alt="Logo"
        class="w-[120px] h-auto"
      />
    </div>

    <div class="w-full lg:w-1/2 bg-white flex flex-col justify-center items-center p-8 lg:p-10">
      <h1 class="text-3xl font-bold mb-6 text-black">Login</h1>
      
      <form class="w-full max-w-xs">
        <div class="mb-4">
          <label for="email" class="block text-black"></label>
          <input
            type="email"
            id="email"
            placeholder="Digite seu email"
            class="w-full mt-2 px-4 py-2 border-b-2 border-black focus:outline-none focus:border-[#EFB11E]"
          />
        </div>

        <div class="mb-6">
          <label for="senha" class="block text-black"></label>
          <input
            type="password"
            id="senha"
            placeholder="Digite sua senha"
            class="w-full mt-2 px-4 py-2 border-b-2 border-black focus:outline-none focus:border-[#EFB11E]"
          />
        </div>

        <button
          type="submit"
          class="w-full py-2 bg-[#EFB11E] text-black font-bold rounded-full hover:bg-[#E8A81D]"
        >
          ENTRAR
        </button>
      </form>
    </div>
  </div>
</template>
