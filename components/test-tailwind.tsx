export function TestTailwind() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Tailwind CSS Test</h1>
      <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-4">
        <div className="shrink-0">
          <div className="h-12 w-12 bg-blue-500 rounded-full"></div>
        </div>
        <div>
          <div className="text-xl font-medium text-black">Test Component</div>
          <p className="text-gray-500">If you see styled elements, Tailwind is working!</p>
        </div>
      </div>
      <div className="mt-8 p-4 bg-green-100 text-green-800 rounded-lg">
        <p>If this text is green and has a light green background, Tailwind's utilities are working.</p>
      </div>
    </div>
  );
}
