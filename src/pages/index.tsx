import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { RichText } from 'prismic-dom';
import Link from 'next/link';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FaCalendarAlt, FaUserAlt } from 'react-icons/fa';
import Header from '../components/Header/index';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ next_page, results }: PostPagination) {
  let posts;

  if (results) {
    posts = results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: format(
          new Date(post.first_publication_date),
          'PP',
          {
            locale: ptBR,
          }
        ),
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    });
  }

  return (
    <div className={styles.home_container}>
      <Header />

      <main className={styles.posts}>
        {posts &&
          posts.map((post: Post) => (
            <Link href={`/posts/${post.uid}`}>
              <div className={styles.post} key={post.uid}>
                <h1 className={styles.title}>{post.data.title}</h1>
                <span>{post.data.subtitle}</span>
                <div className={styles.infos}>
                  <div className={styles.calendar}>
                    <FaCalendarAlt />
                    <span>{post.first_publication_date}</span>
                  </div>

                  <div className={styles.user}>
                    <FaUserAlt />
                    <span>{post.data.author}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}

        {next_page && (
          <button type="button" className={styles.carregar_mais}>
            Carregar mais posts
          </button>
        )}
      </main>
    </div>
  );
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient();
  const response = await prismic.query(
    Prismic.predicates.at("document.type", "post"),
    { pageSize: 20 }
  );

  const { next_page, results } = response;

  return {
    props: { next_page, results },
  };
};
