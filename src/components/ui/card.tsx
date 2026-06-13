import { twMerge } from 'tailwind-merge';

const Card = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={twMerge(
        'group/card flex flex-col gap-(--gutter) rounded-lg border py-(--gutter) text-fg shadow-xs [--gutter:--spacing(6)] has-[table]:overflow-hidden has-[table]:not-has-data-[slot=card-footer]:pb-0 **:data-[slot=table-header]:bg-muted/50 has-[table]:**:data-[slot=card-footer]:border-t **:[table]:overflow-hidden',
        className,
      )}
      data-slot="card"
      {...props}
    />
  );
};

type HeaderProps = {
  description?: string;
  title?: string;
} & React.HTMLAttributes<HTMLDivElement>;

const CardHeader = ({
  children,
  className,
  description,
  title,
  ...props
}: HeaderProps) => (
  <div
    className={twMerge(
      'grid auto-rows-min grid-rows-[auto_auto] items-start gap-1 px-(--gutter) has-data-[slot=card-action]:grid-cols-[1fr_auto]',
      className,
    )}
    data-slot="card-header"
    {...props}
  >
    {title && <CardTitle>{title}</CardTitle>}
    {description && <CardDescription>{description}</CardDescription>}
    {!title && typeof children === 'string' ? (
      <CardTitle>{children}</CardTitle>
    ) : (
      children
    )}
  </div>
);

const CardTitle = ({ className, ...props }: React.ComponentProps<'div'>) => {
  return (
    <div
      className={twMerge(
        'text-balance font-display font-semibold text-base/6',
        className,
      )}
      data-slot="card-title"
      {...props}
    />
  );
};

const CardDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={twMerge(
        'row-start-2 text-pretty text-muted-fg text-sm/6',
        className,
      )}
      data-slot="card-description"
      {...props}
    />
  );
};

const CardAction = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={twMerge(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className,
      )}
      data-slot="card-action"
      {...props}
    />
  );
};

const CardContent = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={twMerge('px-(--gutter) has-[table]:border-t', className)}
      data-slot="card-content"
      {...props}
    />
  );
};

const CardFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={twMerge(
        'flex items-center px-(--gutter) group-has-[table]/card:pt-(--gutter) [.border-t]:pt-6',
        className,
      )}
      data-slot="card-footer"
      {...props}
    />
  );
};

export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
};
