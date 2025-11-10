type MenuItem = {
  name: string;
  description?: string;
  price?: string;
};

type Props = {
  title: string;
  items: MenuItem[];
};

export default function MenuSection({ title, items }: Props) {
  return (
    <section className="mb-10">
      <h2 className="text-brandAccent text-xl font-semibold tracking-wide mb-4 border-b border-white/10 pb-2">
        {title}
      </h2>

      <ul className="space-y-4">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex flex-col sm:flex-row sm:items-start sm:justify-between"
          >
            <div>
              <div className="text-white text-lg font-medium">{item.name}</div>
              {item.description && (
                <div className="text-white/60 text-sm max-w-md">
                  {item.description}
                </div>
              )}
            </div>
            {item.price && (
              <div className="text-brandAccent text-right text-base font-semibold mt-1 sm:mt-0 min-w-[4rem]">
                {item.price}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}