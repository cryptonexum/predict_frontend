const Pagination = ({ meta, page, setPage }) => {
  const pages = Array.from({ length: meta.totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-center items-center gap-2 p-4">
      <button
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        className="px-3 py-1 bg-slate-800 rounded disabled:opacity-50"
      >
        Prev
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => setPage(p)}
          className={`px-3 py-1 rounded ${
            page === p ? 'bg-blue-600' : 'bg-slate-800'
          }`}
        >
          {p}
        </button>
      ))}
      <button
        disabled={page === meta.totalPages}
        onClick={() => setPage(page + 1)}
        className="px-3 py-1 bg-slate-800 rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;